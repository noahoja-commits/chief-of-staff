import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const taskRouter = createTRPCRouter({
  list: protectedProcedure
    .input(z.object({ status: z.string().optional() }).optional())
    .query(async ({ ctx, input }) => {
      return ctx.prisma.task.findMany({
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
      description: z.string().optional(),
      dueDate: z.string().datetime().optional(),
      priority: z.enum(["low", "medium", "high"]).default("medium"),
      contactId: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.task.create({
        data: {
          ...input,
          userId: ctx.session.user.id,
          dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
        },
      });
    }),

  update: protectedProcedure
    .input(z.object({ id: z.string(), title: z.string().optional(), description: z.string().optional(), dueDate: z.string().datetime().optional(), status: z.string().optional(), priority: z.string().optional(), contactId: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.prisma.task.update({
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
      return ctx.prisma.task.delete({ where: { id: input.id } });
    }),
});
