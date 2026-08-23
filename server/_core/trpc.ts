import { NOT_ADMIN_ERR_MSG, UNAUTHED_ERR_MSG } from "@shared/const";
import { TRPCError, initTRPC } from "@trpc/server";
import superjson from "superjson";
import { isAdminRole, isPrincipalRole } from "../roles";
import { assertProcedureAllowed } from "../requestRateLimit";
import type { TrpcContext } from "./context";

const t = initTRPC.context<TrpcContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    if (process.env.NODE_ENV !== "production" || error.code !== "INTERNAL_SERVER_ERROR") return shape;
    return { ...shape, message: "Request could not be processed.", data: { ...shape.data, stack: undefined } };
  },
});
export const router = t.router;
export const publicProcedure = t.procedure.use(
  t.middleware(({ ctx, next }) => {
    assertProcedureAllowed(ctx.req, ctx.res, { scope: "public", maxRequests: 90, windowMs: 10 * 60 * 1000 });
    return next();
  }),
);

export const protectedProcedure = t.procedure.use(
  t.middleware(({ ctx, next }) => {
    if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
    assertProcedureAllowed(ctx.req, ctx.res, { scope: "protected", maxRequests: 150, windowMs: 10 * 60 * 1000 }, String(ctx.user.id));
    return next({ ctx: { ...ctx, user: ctx.user } });
  }),
);

export const adminProcedure = t.procedure.use(
  t.middleware(({ ctx, next }) => {
    if (!ctx.user || !isAdminRole(ctx.user.role) || !ctx.user.isActive) {
      throw new TRPCError({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }
    assertProcedureAllowed(ctx.req, ctx.res, { scope: "admin", maxRequests: 180, windowMs: 10 * 60 * 1000 });
    return next({ ctx: { ...ctx, user: ctx.user } });
  }),
);

export const principalProcedure = t.procedure.use(
  t.middleware(({ ctx, next }) => {
    if (!ctx.user || !isPrincipalRole(ctx.user.role) || !ctx.user.isActive) {
      throw new TRPCError({ code: "FORBIDDEN", message: "This action is reserved for the principal administrator." });
    }
    assertProcedureAllowed(ctx.req, ctx.res, { scope: "principal", maxRequests: 120, windowMs: 10 * 60 * 1000 });
    return next({ ctx: { ...ctx, user: ctx.user } });
  }),
);
