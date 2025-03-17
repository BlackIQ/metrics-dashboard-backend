// ----------------------------------------------
// $app/routes/permission
// permission.routes.js
// ----------------------------------------------
// Permission Routes.
// All routes of permission crud.

import express from "express";

import { Permission } from "$app/controllers/index.js";
import {
  permissionSchema,
  permissionUpdateSchema,
  permissionParamsSchema,
} from "$app/validations/index.js";
import { superuser, validate } from "$app/middlewares/index.js";

const router = express.Router();

router.use(superuser);

router.get("/", Permission.ALL);
router.post("/", validate({ bodySchema: permissionSchema }), Permission.CREATE);
router.get(
  "/:id",
  validate({ paramsSchema: permissionParamsSchema }),
  Permission.SINGLE
);
router.delete(
  "/:id",
  validate({ paramsSchema: permissionParamsSchema }),
  Permission.DELETE
);
router.patch(
  "/:id",
  validate({
    bodySchema: permissionUpdateSchema,
    paramsSchema: permissionParamsSchema,
  }),
  Permission.UPDATE
);

export default router;
