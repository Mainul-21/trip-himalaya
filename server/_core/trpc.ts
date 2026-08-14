import { NOT_ADMIN_ERR_MSG, UNAUTHED_ERR_MSG } from "@shared/const";
import { TRPCError, initTRPC } from "@trpc/server";
import superjson from "superjson";
import { isAdminRole, isPrincipalRole } from "../roles";
import type { TrpcContext } from "./context";

const t = initTRPC.context<TrpcContext>().create({ transformer: superjson });
export const router = t.router;
export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(
  t.middleware(({ ctx, next }) => {
    if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
    return next({ ctx: { ...ctx, user: ctx.user } });
  }),
);

export const adminProcedure = t.procedure.use(
  t.middleware(({ ctx, next }) => {
    if (!ctx.user || !isAdminRole(ctx.user.role) || !ctx.user.isActive) {
      throw new TRPCError({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }
    return next({ ctx: { ...ctx, user: ctx.user } });
  }),
);

export const principalProcedure = t.procedure.use(
  t.middleware(({ ctx, next }) => {
    if (!ctx.user || !isPrincipalRole(ctx.user.role) || !ctx.user.isActive) {
      throw new TRPCError({ code: "FORBIDDEN", message: "This action is reserved for the principal administrator." });
    }
    return next({ ctx: { ...ctx, user: ctx.user } });
  }),
);
