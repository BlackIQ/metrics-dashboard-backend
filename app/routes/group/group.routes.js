// ----------------------------------------------
// $app/routes/group
// group.routes.js
// ----------------------------------------------
// Group Routes.
// All routes of group crud.

import express from "express";

import { Group } from "$app/controllers/index.js";

const router = express.Router();

router.get("/", Group.ALL);
router.post("/", Group.CREATE);
router.get("/:id", Group.SINGLE);
router.delete("/:id", Group.DELETE);
router.patch("/:id", Group.UPDATE);

export default router;
