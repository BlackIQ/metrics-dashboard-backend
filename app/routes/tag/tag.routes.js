// ----------------------------------------------
// $app/routes/tag
// tag.routes.js
// ----------------------------------------------
// Tag Routes.
// All routes of tag crud.

import express from "express";

import { Tag } from "$app/controllers/index.js";
import {
  tagSchema,
  tagUpdateSchema,
  tagParamsSchema,
  paginationSchema,
} from "$app/validations/index.js";
import { resourceOwnership, validate } from "$app/middlewares/index.js";

const router = express.Router();

router.get("/", validate({ querySchema: paginationSchema }), Tag.ALL);
router.post("/", validate({ bodySchema: tagSchema }), Tag.CREATE);
router.get(
  "/:id",
  validate({ paramsSchema: tagParamsSchema }),
  resourceOwnership("Tag"),
  Tag.SINGLE
);
router.delete(
  "/:id",
  validate({ paramsSchema: tagParamsSchema }),
  resourceOwnership("Tag"),
  Tag.DELETE
);
router.patch(
  "/:id",
  validate({ bodySchema: tagUpdateSchema, paramsSchema: tagParamsSchema }),
  resourceOwnership("Tag"),
  Tag.UPDATE
);

export default router;
