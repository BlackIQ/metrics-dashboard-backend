// ----------------------------------------------
// $app/routes/alert
// alert.routes.js
// ----------------------------------------------
// Alert Routes.
// All routes of alert stuff.

import express from "express";

import { Alert } from "$app/controllers/index.js";
import {
  alertSchema,
  alertUpdateSchema,
  alertParamsSchema,
  alertTestSchema,
  paginationSchema,
} from "$app/validations/index.js";
import { resourceOwnership, validate } from "$app/middlewares/index.js";

const router = express.Router();

router.get("/", validate({ querySchema: paginationSchema }), Alert.ALL);
router.post("/", validate({ bodySchema: alertSchema }), Alert.CREATE);
router.patch(
  "/:id",
  validate({ bodySchema: alertUpdateSchema, paramsSchema: alertParamsSchema }),
  resourceOwnership("Alert"),
  Alert.UPDATE
);
router.delete(
  "/:id",
  validate({ paramsSchema: alertParamsSchema }),
  resourceOwnership("Alert"),
  Alert.DELETE
);
router.post(
  "/test",
  validate({ bodySchema: alertTestSchema }),
  Alert.TEST_ALERT
);

export default router;
