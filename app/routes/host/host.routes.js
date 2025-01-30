// ----------------------------------------------
// $app/routes/host
// host.routes.js
// ----------------------------------------------
// Host Routes.
// All routes of host crud.

import express from "express";

import { Host } from "$app/controllers/index.js";

const router = express.Router();

router.get("/", Host.ALL);
router.post("/", Host.CREATE);
router.get("/:id", Host.SINGLE);
router.delete("/:id", Host.DELETE);
router.patch("/:id", Host.UPDATE);
router.post("/check", Host.CHECK);

export default router;
