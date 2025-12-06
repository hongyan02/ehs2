import { Hono } from "hono";
import { requirePermission, authMiddleware } from "@server/middleware/auth";
import {
    getPermissionDefinitionsController,
    getPermissionDefinitionByIdController,
    createPermissionDefinitionController,
    updatePermissionDefinitionController,
    deletePermissionDefinitionController,
    getUserPermissionsController,
    getUserPermissionByIdController,
    createUserPermissionController,
    updateUserPermissionController,
    deleteUserPermissionController,
} from "./controller";

const permissionsRouter = new Hono();
permissionsRouter.use("*", authMiddleware);

// 权限定义路由
permissionsRouter.get("/definitions", requirePermission("ADMIN"), getPermissionDefinitionsController);
permissionsRouter.get("/definitions/:id", requirePermission("ADMIN"), getPermissionDefinitionByIdController);
permissionsRouter.post("/definitions", requirePermission("ADMIN"), createPermissionDefinitionController);
permissionsRouter.put("/definitions/:id", requirePermission("ADMIN"), updatePermissionDefinitionController);
permissionsRouter.delete(
    "/definitions/:id", requirePermission("ADMIN"),
    deletePermissionDefinitionController,
);

// 用户权限路由
permissionsRouter.get("/users", requirePermission("ADMIN"), getUserPermissionsController);
permissionsRouter.get("/users/:id", requirePermission("ADMIN"), getUserPermissionByIdController);
permissionsRouter.post("/users", requirePermission("ADMIN"), createUserPermissionController);
permissionsRouter.put("/users/:id", requirePermission("ADMIN"), updateUserPermissionController);
permissionsRouter.delete("/users/:id", requirePermission("ADMIN"), deleteUserPermissionController);

export default permissionsRouter;
