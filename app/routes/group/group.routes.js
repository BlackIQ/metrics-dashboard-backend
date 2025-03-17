// ----------------------------------------------
// $app/routes/group
// group.routes.js
// ----------------------------------------------
// Group Routes.
// All routes of group crud.

import express from "express";

import { Group } from "$app/controllers/index.js";
import {
  groupSchema,
  groupUpdateSchema,
  groupParamsSchema,
} from "$app/validations/index.js";
import { resourceOwnership, validate } from "$app/middlewares/index.js";

const router = express.Router();

router.get("/", Group.ALL);
router.post("/", validate({ bodySchema: groupSchema }), Group.CREATE);
router.get(
  "/:id",
  validate({ paramsSchema: groupParamsSchema }),
  resourceOwnership("Group"),
  Group.SINGLE
);
router.delete(
  "/:id",
  validate({ paramsSchema: groupParamsSchema }),
  resourceOwnership("Group"),
  Group.DELETE
);
router.patch(
  "/:id",
  validate({ bodySchema: groupUpdateSchema, paramsSchema: groupParamsSchema }),
  resourceOwnership("Group"),
  Group.UPDATE
);

export default router;
