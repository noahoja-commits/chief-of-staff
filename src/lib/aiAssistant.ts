import { prisma } from "../server/db";
import { decryptSecret } from "./crypto";
import { callOpenAI, callAnthropic, type SimpleMessage } from "./providerLLM";

export type ActionType =
  | "create_contact"
  | "create_company"
  | "create_task"
  | "create_reminder"
  | "create_follow_up"
  | "update_contact"
  | "update_task"
  | "no_action";

export interface AssistantAction {
  type: ActionType;
  data: Record<string, unknown>;
}

export interface AssistantResult {
  actions: AssistantAction[];
  reply: string;
  suggestedFollowUp?: string;
}

const SYSTEM_PROMPT = `You are an AI Chief of Staff assistant. Parse the user's message and return a JSON response with actions.

Available actions:
- create_contact: { name, email?, phone?, company?, notes? }
- create_company: { name, domain?, notes? }
- create_task: { title, description?, dueDate?, contactName?, priority?: "low" | "medium" | "high" }
- create_reminder: { title, dueDate?, recurring?: "daily" | "weekly" | "monthly", contactName? }
- create_follow_up: { contactName, dueDate, reason?, notes? }
- update_contact: { name, field: "email" | "phone" | "notes" | "company", value }
- update_task: { title, field: "status" | "dueDate" | "priority", value }
- no_action: { reason }

Rules:
1. Infer dates relative to today. Use ISO 8601 format.
2. If a contact is mentioned but not found, create a contact action first.
3. Return friendly, concise reply.
4. Always return valid JSON.

Response JSON schema:
{
  "actions": [{ "type": "...", "data": { ... } }],
  "reply": "friendly summary",
  "suggestedFollowUp": "optional suggestion"
}

Examples:
User: "remind me to call Alex Thursday"
→ { "actions": [{"type":"create_reminder","data":{"title":"Call Alex","dueDate":"2024-06-27T09:00:00"}}], "reply": "I'll remind you to call Alex on Thursday at 9 AM.", "suggestedFollowUp": "Want me to schedule a follow-up after the call?" }

User: "add Sarah from Acme as a contact with email sarah@acme.com"
→ { "actions": [{"type":"create_contact","data":{"name":"Sarah","email":"sarah@acme.com","company":"Acme"}}], "reply": "Added Sarah from Acme to your contacts." }`;

export async function parseAssistantMessage(
  userId: string,
  message: string,
  todayISO: string,
  userTimezone: string
): Promise<AssistantResult> {
  const settings = await prisma.userSettings.findUnique({ where: { userId } });
  if (!settings) {
    return { actions: [{ type: "no_action", data: { reason: "Settings not found" } }], reply: "Please set up your API key in Settings first." };
  }

  let apiKey: string | null = null;
  let provider: "openai" | "anthropic" = "openai";

  if (settings.preferredProvider === "anthropic" && settings.anthropicKey) {
    apiKey = decryptSecret(settings.anthropicKey);
    provider = "anthropic";
  } else if (settings.preferredProvider === "openai" && settings.openaiKey) {
    apiKey = decryptSecret(settings.openaiKey);
  } else if (settings.openaiKey) {
    apiKey = decryptSecret(settings.openaiKey);
  } else if (settings.anthropicKey) {
    apiKey = decryptSecret(settings.anthropicKey);
    provider = "anthropic";
  }

  if (!apiKey) {
    return { actions: [{ type: "no_action", data: { reason: "No API key" } }], reply: "Please add an API key in Settings." };
  }

  const messages: SimpleMessage[] = [
    { role: "system", content: SYSTEM_PROMPT + `\n\nToday is ${todayISO}. Timezone: ${userTimezone}.` },
    { role: "user", content: message },
  ];

  let raw: string;
  try {
    if (provider === "anthropic") {
      raw = await callAnthropic({ apiKey, messages, model: "claude-3-5-sonnet-20241022", maxTokens: 1024, temperature: 0.2 });
    } else {
      raw = await callOpenAI({ apiKey, messages, model: "gpt-4o-mini", maxTokens: 1024, temperature: 0.2 });
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { actions: [{ type: "no_action", data: { reason: msg } }], reply: `AI error: ${msg}. Check your API key.` };
  }

  try {
    const cleaned = raw.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
    const parsed = JSON.parse(cleaned) as AssistantResult;
    if (!parsed.actions || !Array.isArray(parsed.actions)) parsed.actions = [];
    if (!parsed.reply || typeof parsed.reply !== "string") parsed.reply = "Done.";
    return parsed;
  } catch {
    return { actions: [], reply: raw.trim() || "I'm not sure how to help with that. Could you rephrase?" };
  }
}

export async function executeActions(userId: string, actions: AssistantAction[]) {
  const errors: string[] = [];
  const createdIds: string[] = [];
  let executed = 0;

  for (const action of actions) {
    try {
      switch (action.type) {
        case "create_contact": {
          const d = action.data as { name: string; email?: string; phone?: string; company?: string; notes?: string };
          let companyId: string | undefined;
          if (d.company) {
            const existing = await prisma.company.findFirst({ where: { userId, name: d.company } });
            if (existing) companyId = existing.id;
            else { const c = await prisma.company.create({ data: { name: d.company, userId } }); companyId = c.id; createdIds.push(c.id); }
          }
          const contact = await prisma.contact.create({ data: { name: d.name, email: d.email, phone: d.phone, companyId, notes: d.notes, userId } });
          createdIds.push(contact.id); executed++;
          break;
        }
        case "create_company": {
          const d = action.data as { name: string; domain?: string; notes?: string };
          const c = await prisma.company.create({ data: { name: d.name, domain: d.domain, notes: d.notes, userId } });
          createdIds.push(c.id); executed++;
          break;
        }
        case "create_task": {
          const d = action.data as { title: string; description?: string; dueDate?: string; contactName?: string; priority?: "low" | "medium" | "high" };
          let contactId: string | undefined;
          if (d.contactName) { const c = await prisma.contact.findFirst({ where: { userId, name: d.contactName } }); if (c) contactId = c.id; }
          const t = await prisma.task.create({
            data: { title: d.title, description: d.description, dueDate: d.dueDate ? new Date(d.dueDate) : undefined, contactId, priority: d.priority ?? "medium", userId }
          });
          createdIds.push(t.id); executed++;
          break;
        }
        case "create_reminder": {
          const d = action.data as { title: string; dueDate?: string; recurring?: "daily" | "weekly" | "monthly"; contactName?: string };
          let contactId: string | undefined;
          if (d.contactName) { const c = await prisma.contact.findFirst({ where: { userId, name: d.contactName } }); if (c) contactId = c.id; }
          const r = await prisma.reminder.create({
            data: { title: d.title, dueDate: d.dueDate ? new Date(d.dueDate) : undefined, recurring: d.recurring, contactId, userId }
          });
          createdIds.push(r.id); executed++;
          break;
        }
        case "create_follow_up": {
          const d = action.data as { contactName: string; dueDate: string; reason?: string; notes?: string };
          const c = await prisma.contact.findFirst({ where: { userId, name: d.contactName } });
          if (!c) { errors.push(`Contact "${d.contactName}" not found.`); continue; }
          const f = await prisma.followUp.create({ data: { contactId: c.id, dueDate: new Date(d.dueDate), reason: d.reason, notes: d.notes, userId } });
          createdIds.push(f.id); executed++;
          break;
        }
        case "update_contact": {
          const d = action.data as { name: string; field: string; value: string };
          const c = await prisma.contact.findFirst({ where: { userId, name: d.name } });
          if (!c) { errors.push(`Contact "${d.name}" not found.`); continue; }
          await prisma.contact.update({ where: { id: c.id }, data: { [d.field]: d.value } });
          executed++;
          break;
        }
        case "update_task": {
          const d = action.data as { title: string; field: string; value: string };
          const t = await prisma.task.findFirst({ where: { userId, title: d.title } });
          if (!t) { errors.push(`Task "${d.title}" not found.`); continue; }
          await prisma.task.update({ where: { id: t.id }, data: { [d.field]: d.value } });
          executed++;
          break;
        }
        case "no_action": break;
        default: errors.push(`Unknown action: ${action.type}`);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      errors.push(`${action.type} failed: ${msg}`);
    }
  }
  return { executed, errors, createdIds };
}

export async function handleAssistantMessage(userId: string, message: string) {
  const now = new Date();
  const settings = await prisma.userSettings.findUnique({ where: { userId } });
  const tz = settings?.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone;
  const todayISO = new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }).format(now).replace(", ", "T").replace(/\//g, "-");

  const parsed = await parseAssistantMessage(userId, message, todayISO, tz);
  const { executed, errors, createdIds } = await executeActions(userId, parsed.actions);

  await prisma.chatMessage.create({ data: { userId, role: "user", content: message } });
  await prisma.chatMessage.create({ data: { userId, role: "assistant", content: parsed.reply, metadata: JSON.stringify({ actions: parsed.actions, createdIds, errors }) } });

  return { reply: parsed.reply, actionsTaken: executed, errors: errors.length ? errors : [] };
}
