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
  authChangeEmailSchema,
  authConfirmEmailChangeSchema,
  authForgotPasswordSchema,
  authResetPasswordSchema,
} from "$app/validations/index.js";
import { validate, jwt } from "$app/middlewares/index.js";

const router = express.Router();

// Authentocation
router.post("/login", validate({ bodySchema: authLoginSchema }), Auth.LOGIN);
router.post(
  "/register",
  validate({ bodySchema: authRegisterSchema }),
  Auth.REGISTER
);

// Logout
router.post("/logout", Auth.LOGOUT);

// Confirm Account
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

// Change Email
router.post(
  "/change-email",
  jwt,
  validate({ bodySchema: authChangeEmailSchema }),
  Auth.CHANGE_EMAIL
);
router.post(
  "/confirm-email-change",
  validate({ bodySchema: authConfirmEmailChangeSchema }),
  Auth.CONFIRM_EMAIL_CHANGE
);

// Reset Password
router.post(
  "/forgot-password",
  validate({ bodySchema: authForgotPasswordSchema }),
  Auth.FORGOT_PASSWORD
);
router.post(
  "/reset-password",
  validate({ bodySchema: authResetPasswordSchema }),
  Auth.RESET_PASSWORD
);

export default router;
