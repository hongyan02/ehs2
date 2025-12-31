import { createMiddleware } from "hono/factory";
import { verify } from "hono/jwt";
import { getCookie } from "hono/cookie";

type AuthVariables = {
    user: {
        employeeId: string;
        name: string;
        permissions: string[];
    };
};

export const authMiddleware = createMiddleware<{ Variables: AuthVariables }>(
    async (c, next) => {
        const token = getCookie(c, "Permission-Token");

        if (!token) {
            return c.json({ error: "Unauthorized: No token provided" }, 401);
        }

        try {
            const jwtSecret = process.env.JWT_SECRET || "default_secret_please_change";
            const payload = (await verify(token, jwtSecret)) as Record<string, unknown>;

            const employeeId =
                (payload.employeeId as string | undefined) ??
                (payload.sub as string | undefined) ??
                (payload.username as string | undefined) ??
                "";
            const name =
                (payload.name as string | undefined) ??
                (payload.nickName as string | undefined) ??
                (payload.username as string | undefined) ??
                employeeId;

            if (!employeeId) {
                return c.json({ error: "Unauthorized: Invalid token payload" }, 401);
            }

            c.set("user", {
                employeeId,
                name,
                permissions: (payload.permissions as string[]) || [],
            });

            await next();
        } catch (_e) {
            return c.json({ error: "Unauthorized: Invalid token" }, 401);
        }
    }
);

export const requirePermission = (permission: string) =>
    createMiddleware<{ Variables: AuthVariables }>(async (c, next) => {
        const user = c.get("user");
        if (!user || !user.permissions.includes(permission)) {
            return c.json({ error: "Forbidden: Insufficient permissions" }, 403);
        }
        await next();
    });
