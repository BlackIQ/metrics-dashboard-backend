// ----------------------------------------------
// $app/routes/tag
// tag.routes.js
// ----------------------------------------------
// Tag Routes.
// All routes of tag crud.

import express from "express";

import { Tag } from "$app/controllers/index.js";

import { resourceOwnership } from "$app/middlewares/index.js";

const router = express.Router();

router.get("/", Tag.ALL);
router.post("/", Tag.CREATE);
router.get("/:id", resourceOwnership("Tag"), Tag.SINGLE);
router.delete("/:id", resourceOwnership("Tag"), Tag.DELETE);
router.patch("/:id", resourceOwnership("Tag"), Tag.UPDATE);

export default router;
