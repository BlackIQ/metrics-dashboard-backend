// ----------------------------------------------
// $app/routes/permission
// permission.routes.js
// ----------------------------------------------
// Permission Routes.
// All routes of permission crud.

import express from "express";

import { Metric } from "$app/controllers/index.js";

const router = express.Router();

router.post("/pull", Metric.PULL);
router.get("/:host", Metric.READ);

export default router;
