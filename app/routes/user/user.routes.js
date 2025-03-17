// ----------------------------------------------
// $app/routes/user
// user.routes.js
// ----------------------------------------------
// User Routes.
// All routes of user crud.

import express from "express";

import { User } from "$app/controllers/index.js";

import { userOwnership } from "$app/middlewares/index.js";

const router = express.Router();

router.get("/", User.ALL);
router.get("/:id", userOwnership, User.SINGLE);
router.delete("/:id", userOwnership, User.DELETE);
router.patch("/:id", userOwnership, User.UPDATE);
router.patch("/password/:id", userOwnership, User.CHANGE_PASSWORD);

export default router;
