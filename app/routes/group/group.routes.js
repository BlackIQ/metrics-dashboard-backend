// ----------------------------------------------
// $app/routes/group
// group.routes.js
// ----------------------------------------------
// Group Routes.
// All routes of group crud.

import express from "express";

import { Group } from "$app/controllers/index.js";

import { resourceOwnership } from "$app/middlewares/index.js";

const router = express.Router();

router.get("/", Group.ALL);
router.post("/", Group.CREATE);
router.get("/:id", resourceOwnership("Group"), Group.SINGLE);
router.delete("/:id", resourceOwnership("Group"), Group.DELETE);
router.patch("/:id", resourceOwnership("Group"), Group.UPDATE);

export default router;
