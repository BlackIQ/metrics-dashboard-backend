// ----------------------------------------------
// $app/routes/page
// page.routes.js
// ----------------------------------------------
// Page Routes.
// All routes of page crud.

import express from "express";

import { Page } from "$app/controllers/index.js";
import {
  pageSchema,
  pageUpdateSchema,
  pageParamsSchema,
} from "$app/validations/index.js";
import { resourceOwnership, validate } from "$app/middlewares/index.js";

const router = express.Router();

router.get("/", Page.ALL);
router.post("/", validate({ bodySchema: pageSchema }), Page.CREATE);
router.get(
  "/:id",
  validate({ paramsSchema: pageParamsSchema }),
  resourceOwnership("Page"),
  Page.SINGLE
);
router.delete(
  "/:id",
  validate({ paramsSchema: pageParamsSchema }),
  resourceOwnership("Page"),
  Page.DELETE
);
router.patch(
  "/:id",
  validate({ bodySchema: pageUpdateSchema, paramsSchema: pageParamsSchema }),
  resourceOwnership("Page"),
  Page.UPDATE
);

export default router;
