import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const reminderRouter = createTRPCRouter({
  list: protectedProcedure
    .input(z.object({ status: z.string().optional() }).optional())
    .query(async ({ ctx, input }) => {
      return ctx.prisma.reminder.findMany({
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
      title: z.string().min(1),
      dueDate: z.string().datetime().optional(),
      recurring: z.enum(["daily", "weekly", "monthly"]).optional(),
      contactId: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.reminder.create({
        data: {
          ...input,
          userId: ctx.session.user.id,
          dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
        },
      });
    }),

  update: protectedProcedure
    .input(z.object({ id: z.string(), title: z.string().optional(), dueDate: z.string().datetime().optional(), status: z.string().optional(), recurring: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.prisma.reminder.update({
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
      return ctx.prisma.reminder.delete({ where: { id: input.id } });
    }),
});
