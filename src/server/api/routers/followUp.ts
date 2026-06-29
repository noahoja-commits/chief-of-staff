import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const followUpRouter = createTRPCRouter({
  list: protectedProcedure
    .input(z.object({ status: z.string().optional() }).optional())
    .query(async ({ ctx, input }) => {
      return ctx.prisma.followUp.findMany({
        where: {
          userId: ctx.session.user.id,
          ...(input?.status ? { status: input.status } : {}),
        },
        include: { contact: true },
        orderBy: { dueDate: "asc" },
      });
    }),

  create: protectedProcedure
    .input(z.object({
      contactId: z.string(),
      dueDate: z.string().datetime(),
      reason: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.followUp.create({
        data: {
          ...input,
          userId: ctx.session.user.id,
          dueDate: new Date(input.dueDate),
        },
      });
    }),

  update: protectedProcedure
    .input(z.object({ id: z.string(), dueDate: z.string().datetime().optional(), status: z.string().optional(), reason: z.string().optional(), notes: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.prisma.followUp.update({
        where: { id },
        data: {
          ...data,
          dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        },
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.followUp.delete({ where: { id: input.id } });
    }),
});
