// ----------------------------------------------
// $app/routes/auth
// auth.routes.js
// ----------------------------------------------
// Auth Routes.
// All routes of authentication.

import express from "express";

import { Auth } from "$app/controllers/index.js";
import {
  authLoginSchema,
  authRegisterSchema,
  authConfirmSchema,
  authResendConfirmSchema,
} from "$app/validations/index.js";
import { validate } from "$app/middlewares/index.js";

const router = express.Router();

router.post("/login", validate({ bodySchema: authLoginSchema }), Auth.LOGIN);
router.post(
  "/register",
  validate({ bodySchema: authRegisterSchema }),
  Auth.REGISTER
);
router.post(
  "/confirm",
  validate({ bodySchema: authConfirmSchema }),
  Auth.CONFIRM
);
router.post(
  "/resend-confirm",
  validate({ bodySchema: authResendConfirmSchema }),
  Auth.RESEND_CONFIRM
);
router.post("/logout", Auth.LOGOUT);

export default router;
