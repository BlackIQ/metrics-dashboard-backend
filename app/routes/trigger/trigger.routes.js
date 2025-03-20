// ----------------------------------------------
// $app/routes/trigger
// trigger.routes.js
// ----------------------------------------------
// Trigger Routes.
// All routes of trigger crud.

import express from "express";

import { Trigger } from "$app/controllers/index.js";
import {
  // triggerSchema,
  // triggerUpdateSchema,
  triggerParamsSchema,
  paginationSchema,
} from "$app/validations/index.js";
import { superuser, validate } from "$app/middlewares/index.js";

const router = express.Router();

router.use(superuser);

router.get("/", validate({ querySchema: paginationSchema }), Trigger.ALL);
router.post("/", Trigger.CREATE); // , validate({ bodySchema: permissionSchema })
router.get(
  "/:id",
  validate({ paramsSchema: triggerParamsSchema }),
  Trigger.SINGLE
);
router.delete(
  "/:id",
  validate({ paramsSchema: triggerParamsSchema }),
  Trigger.DELETE
);
router.patch(
  "/:id",
  validate({
    // bodySchema: permissionUpdateSchema,
    paramsSchema: triggerParamsSchema,
  }),
  Trigger.UPDATE
);

export default router;
