import { createTRPCRouter } from "./trpc";
import { assistantRouter } from "./routers/assistant";
import { contactRouter } from "./routers/contact";
import { companyRouter } from "./routers/company";
import { taskRouter } from "./routers/task";
import { reminderRouter } from "./routers/reminder";
import { followUpRouter } from "./routers/followUp";
import { settingsRouter } from "./routers/settings";
import { dashboardRouter } from "./routers/dashboard";

export const appRouter = createTRPCRouter({
  assistant: assistantRouter,
  contact: contactRouter,
  company: companyRouter,
  task: taskRouter,
  reminder: reminderRouter,
  followUp: followUpRouter,
  settings: settingsRouter,
  dashboard: dashboardRouter,
});

export type AppRouter = typeof appRouter;
