// ----------------------------------------------
// $app/routes/permission
// permission.routes.js
// ----------------------------------------------
// Permission Routes.
// All routes of permission crud.

import express from "express";

import { Metric } from "$app/controllers/index.js";

import { resourceOwnership } from "$app/middlewares/index.js";

const router = express.Router();

router.post("/:host", resourceOwnership("Host", "host"), Metric.READ);

export default router;
