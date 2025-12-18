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
pointRoute.use("*", authMiddleware);

// --- Person Routes ---
pointRoute.get("/person", getPointPersonController);
pointRoute.post("/person", createPointPersonController);
pointRoute.put("/person/:id", updatePointPersonController);
pointRoute.delete("/person/:id", deletePointPersonController);

// --- Category Routes ---
pointRoute.get("/categories", getPointCategoriesController);
pointRoute.post("/categories", createPointCategoryController);
pointRoute.put("/categories/:id", updatePointCategoryController);
pointRoute.delete("/categories/:id", deletePointCategoryController);

// --- Event Routes ---
pointRoute.get("/events", getPointEventController);
pointRoute.post("/events", createPointEventController);
pointRoute.put("/events/:id", updatePointEventController);
pointRoute.delete("/events/:id", deletePointEventController);

// --- Log Routes ---
pointRoute.get("/logs", getPointLogController);
pointRoute.post("/logs", createPointLogController);
pointRoute.delete("/logs/:id", deletePointLogController);
pointRoute.get("/ranking", getRankingController);
pointRoute.get("/ranking/total", getTotalRankingController);

export default pointRoute;
