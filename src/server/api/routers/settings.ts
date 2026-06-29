import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { encryptSecret, decryptSecret } from "../../../lib/crypto";

export const settingsRouter = createTRPCRouter({
  get: protectedProcedure.query(async ({ ctx }) => {
    const settings = await ctx.prisma.userSettings.findUnique({
      where: { userId: ctx.session.user.id },
    });
    return settings
      ? {
          ...settings,
          openaiKey: settings.openaiKey ? "••••••••" : null,
          anthropicKey: settings.anthropicKey ? "••••••••" : null,
        }
      : null;
  }),

  update: protectedProcedure
    .input(z.object({
      openaiKey: z.string().optional().nullable(),
      anthropicKey: z.string().optional().nullable(),
      preferredProvider: z.enum(["openai", "anthropic", "default"]).optional(),
      timezone: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.prisma.userSettings.findUnique({
        where: { userId: ctx.session.user.id },
      });

      const data: Record<string, unknown> = {};
      if (input.preferredProvider !== undefined) data.preferredProvider = input.preferredProvider;
      if (input.timezone !== undefined) data.timezone = input.timezone;

      // Only encrypt and store if a new key is provided (not masked)
      if (input.openaiKey !== undefined && input.openaiKey !== null && input.openaiKey !== "••••••••") {
        data.openaiKey = encryptSecret(input.openaiKey);
      } else if (input.openaiKey === null) {
        data.openaiKey = null;
      } else if (existing?.openaiKey && input.openaiKey === "••••••••") {
        data.openaiKey = existing.openaiKey;
      }

      if (input.anthropicKey !== undefined && input.anthropicKey !== null && input.anthropicKey !== "••••••••") {
        data.anthropicKey = encryptSecret(input.anthropicKey);
      } else if (input.anthropicKey === null) {
        data.anthropicKey = null;
      } else if (existing?.anthropicKey && input.anthropicKey === "••••••••") {
        data.anthropicKey = existing.anthropicKey;
      }

      return ctx.prisma.userSettings.upsert({
        where: { userId: ctx.session.user.id },
        create: { ...data, userId: ctx.session.user.id } as any,
        update: data as any,
      });
    }),
});
