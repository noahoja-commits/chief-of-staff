import { createTRPCRouter, protectedProcedure } from "../trpc";

export const dashboardRouter = createTRPCRouter({
  briefing: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

    const [tasksDue, remindersDue, followUpsDue, contactsCount, companiesCount] = await Promise.all([
      ctx.prisma.task.findMany({
        where: { userId, status: { not: "done" }, dueDate: { gte: startOfDay, lt: endOfDay } },
        include: { contact: true },
        orderBy: { dueDate: "asc" },
      }),
      ctx.prisma.reminder.findMany({
        where: { userId, status: { not: "completed" }, dueDate: { gte: startOfDay, lt: endOfDay } },
        include: { contact: true },
        orderBy: { dueDate: "asc" },
      }),
      ctx.prisma.followUp.findMany({
        where: { userId, status: { not: "completed" }, dueDate: { gte: startOfDay, lt: endOfDay } },
        include: { contact: true },
        orderBy: { dueDate: "asc" },
      }),
      ctx.prisma.contact.count({ where: { userId } }),
      ctx.prisma.company.count({ where: { userId } }),
    ]);

    return {
      tasksDue,
      remindersDue,
      followUpsDue,
      contactsCount,
      companiesCount,
      overdueTasks: await ctx.prisma.task.count({
        where: { userId, status: { not: "done" }, dueDate: { lt: startOfDay } },
      }),
      overdueReminders: await ctx.prisma.reminder.count({
        where: { userId, status: { not: "completed" }, dueDate: { lt: startOfDay } },
      }),
    };
  }),
});
