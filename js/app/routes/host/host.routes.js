// ----------------------------------------------
// $app/routes/host
// host.routes.js
// ----------------------------------------------
// Host Routes.
// All routes of host crud.

import express from "express";

import { Host } from "$app/controllers/index.js";
import {
  hostSchema,
  hostUpdateSchema,
  hostParamsSchema,
  hostCheckSchema,
  paginationSchema,
} from "$app/validations/index.js";
import { resourceOwnership, validate } from "$app/middlewares/index.js";

const router = express.Router();

router.get("/", validate({ querySchema: paginationSchema }), Host.ALL);
router.post("/", validate({ bodySchema: hostSchema }), Host.CREATE);
router.get(
  "/:id",
  validate({ paramsSchema: hostParamsSchema }),
  resourceOwnership("Host"),
  Host.SINGLE
);
router.delete(
  "/:id",
  validate({ paramsSchema: hostParamsSchema }),
  resourceOwnership("Host"),
  Host.DELETE
);
router.patch(
  "/:id",
  validate({ bodySchema: hostUpdateSchema, paramsSchema: hostParamsSchema }),
  resourceOwnership("Host"),
  Host.UPDATE
);
router.post("/check", validate({ bodySchema: hostCheckSchema }), Host.CHECK);
router.get(
  "/:id/actions",
  validate({ paramsSchema: hostParamsSchema }),
  resourceOwnership("Host"),
  Host.ACTIONS
);

export default router;
