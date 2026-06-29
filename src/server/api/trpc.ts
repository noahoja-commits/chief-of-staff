import { initTRPC, TRPCError } from "@trpc/server";
import { type Session } from "next-auth";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth";
import { prisma } from "../db";

export const createTRPCContext = async (opts: { req: Request }) => {
  const session = await getServerSession(
    opts.req as any,
    {} as any,
    authOptions
  );
  return { session, prisma };
};

export const createTRPCRouter = initTRPC.context<typeof createTRPCContext>().create({
  transformer: undefined,
  errorFormatter({ shape }) {
    return shape;
  },
});

export const publicProcedure = createTRPCRouter.procedure;

export const protectedProcedure = createTRPCRouter.procedure.use(({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({ ctx: { ...ctx, session: { ...ctx.session, user: ctx.session.user } } });
});