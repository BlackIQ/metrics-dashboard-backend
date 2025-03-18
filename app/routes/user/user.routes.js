// ----------------------------------------------
// $app/routes/user
// user.routes.js
// ----------------------------------------------
// User Routes.
// All routes of user crud.

import express from "express";

import { User } from "$app/controllers/index.js";
import {
  userUpdateSchema,
  userParamsSchema,
  userPasswordSchema,
  paginationSchema,
} from "$app/validations/index.js";
import { userOwnership, superuser, validate } from "$app/middlewares/index.js";

const router = express.Router();

router.get(
  "/",
  superuser,
  validate({ querySchema: paginationSchema }),
  User.ALL
);
router.get(
  "/:id",
  validate({ paramsSchema: userParamsSchema }),
  userOwnership,
  User.SINGLE
);
router.delete(
  "/:id",
  validate({ paramsSchema: userParamsSchema }),
  userOwnership,
  User.DELETE
);
router.patch(
  "/:id",
  validate({ bodySchema: userUpdateSchema, paramsSchema: userParamsSchema }),
  userOwnership,
  User.UPDATE
);
router.patch(
  "/password/:id",
  validate({ bodySchema: userPasswordSchema, paramsSchema: userParamsSchema }),
  userOwnership,
  User.CHANGE_PASSWORD
);

export default router;
