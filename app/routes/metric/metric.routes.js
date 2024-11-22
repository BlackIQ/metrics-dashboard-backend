// ----------------------------------------------
// $app/routes/permission
// permission.routes.js
// ----------------------------------------------
// Permission Routes.
// All routes of permission crud.

import express from "express";

import { Metric } from "$app/controllers/index.js";
import { agent } from "$app/middlewares/index.js";

const router = express.Router();

router.post("/", agent, Metric.CREATE);
router.get("/:host", Metric.READ);

export default router;
