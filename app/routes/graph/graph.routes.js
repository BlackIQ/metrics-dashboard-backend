// ----------------------------------------------
// $app/routes/graph
// graph.routes.js
// ----------------------------------------------
// Graph Routes.
// All routes of graph crud.

import express from "express";

import { Graph } from "$app/controllers/index.js";
import {
  graphSchema,
  graphUpdateSchema,
  graphParamsSchema,
} from "$app/validations/index.js";
import { resourceOwnership, validate } from "$app/middlewares/index.js";

const router = express.Router();

router.get("/:page", validate({ paramsSchema: graphParamsSchema }), Graph.ALL);
router.post("/", validate({ bodySchema: graphSchema }), Graph.CREATE);
router.get(
  "/:id",
  validate({ paramsSchema: graphParamsSchema }),
  resourceOwnership("Graph"),
  Graph.SINGLE
);
router.delete(
  "/:id",
  validate({ paramsSchema: graphParamsSchema }),
  resourceOwnership("Graph"),
  Graph.DELETE
);
router.patch(
  "/:id",
  validate({ bodySchema: graphUpdateSchema, paramsSchema: graphParamsSchema }),
  resourceOwnership("Graph"),
  Graph.UPDATE
);

export default router;
