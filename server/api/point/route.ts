import { Hono } from "hono";
import { authMiddleware } from "../../middleware/auth";
import {
    createPointCategoryController,
    createPointEventController,
    createPointLogController,
    createPointPersonController,
    deletePointCategoryController,
    deletePointEventController,
    deletePointLogController,
    deletePointPersonController,
    getPointCategoriesController,
    getPointEventController,
    getPointLogController,
    getPointPersonController,
    getRankingController,
    getTotalRankingController,
    updatePointCategoryController,
    updatePointEventController,
    updatePointPersonController,
} from "./controller";

import kpiRoute from "./kpi/route";

const pointRoute = new Hono();

// Auth for all routes
pointRoute.route("/kpi", kpiRoute);

// --- Person Routes ---
pointRoute.get("/person", getPointPersonController);
pointRoute.post("/person", authMiddleware, createPointPersonController);
pointRoute.put("/person/:id", authMiddleware, updatePointPersonController);
pointRoute.delete("/person/:id", authMiddleware, deletePointPersonController);

// --- Category Routes ---
pointRoute.get("/categories", getPointCategoriesController);
pointRoute.post("/categories", authMiddleware, createPointCategoryController);
pointRoute.put("/categories/:id", authMiddleware, updatePointCategoryController);
pointRoute.delete("/categories/:id", authMiddleware, deletePointCategoryController);

// --- Event Routes ---
pointRoute.get("/events", getPointEventController);
pointRoute.post("/events", authMiddleware, createPointEventController);
pointRoute.put("/events/:id", authMiddleware, updatePointEventController);
pointRoute.delete("/events/:id", authMiddleware, deletePointEventController);

// --- Log Routes ---
pointRoute.get("/logs", getPointLogController);
pointRoute.post("/logs", authMiddleware, createPointLogController);
pointRoute.delete("/logs/:id", authMiddleware, deletePointLogController);
pointRoute.get("/ranking", getRankingController);
pointRoute.get("/ranking/total", getTotalRankingController);

export default pointRoute;
