// ----------------------------------------------
// $app/routes/role
// role.routes.js
// ----------------------------------------------
// Role Routes.
// All routes of role crud.

import express from "express";

import { Role } from "$app/controllers/index.js";
import {
  roleSchema,
  roleUpdateSchema,
  roleParamsSchema,
} from "$app/validations/index.js";
import { superuser, validate } from "$app/middlewares/index.js";

const router = express.Router();

router.use(superuser);

router.get("/", Role.ALL);
router.post("/", validate({ bodySchema: roleSchema }), Role.CREATE);
router.get("/:id", validate({ paramsSchema: roleParamsSchema }), Role.SINGLE);
router.delete(
  "/:id",
  validate({ paramsSchema: roleParamsSchema }),
  Role.DELETE
);
router.patch(
  "/:id",
  validate({ bodySchema: roleUpdateSchema, paramsSchema: roleParamsSchema }),
  Role.UPDATE
);

export default router;
