// ----------------------------------------------
// $app/routes/role
// role.routes.js
// ----------------------------------------------
// Role Routes.
// All routes of role crud.

import express from "express";

import { Role } from "$app/controllers/index.js";

import { superuser } from "$app/middlewares/index.js";

const router = express.Router();

router.use(superuser);

router.get("/", Role.ALL);
router.post("/", Role.CREATE);
router.get("/:id", Role.SINGLE);
router.delete("/:id", Role.DELETE);
router.patch("/:id", Role.UPDATE);

export default router;
