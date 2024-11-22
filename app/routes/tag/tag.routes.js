// ----------------------------------------------
// $app/routes/tag
// tag.routes.js
// ----------------------------------------------
// Tag Routes.
// All routes of tag crud.

import express from "express";

import { Tag } from "$app/controllers/index.js";

const router = express.Router();

router.get("/", Tag.ALL);
router.post("/", Tag.CREATE);
router.get("/:id", Tag.SINGLE);
router.delete("/:id", Tag.DELETE);
router.patch("/:id", Tag.UPDATE);

export default router;
