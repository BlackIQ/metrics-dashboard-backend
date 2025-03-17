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
} from "$app/validations/index.js";
import { resourceOwnership, validate } from "$app/middlewares/index.js";

const router = express.Router();

router.get("/", Alert.ALL);
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
router.post("/test", Alert.TEST_ALERT); // TODO: Validation for TEST

export default router;
