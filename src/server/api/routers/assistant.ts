import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { handleAssistantMessage } from "../../../lib/aiAssistant";

export const assistantRouter = createTRPCRouter({
  sendMessage: protectedProcedure
    .input(z.object({ message: z.string().min(1).max(4000) }))
    .mutation(async ({ ctx, input }) => {
      const result = await handleAssistantMessage(ctx.session.user.id, input.message);
      return result;
    }),

  getHistory: protectedProcedure
    .input(z.object({ limit: z.number().min(1).max(100).default(50) }))
    .query(async ({ ctx, input }) => {
      const messages = await ctx.prisma.chatMessage.findMany({
        where: { userId: ctx.session.user.id },
        orderBy: { createdAt: "asc" },
        take: input.limit,
      });
      return messages;
    }),

  clearHistory: protectedProcedure
    .mutation(async ({ ctx }) => {
      await ctx.prisma.chatMessage.deleteMany({
        where: { userId: ctx.session.user.id },
      });
      return { success: true };
    }),
});
