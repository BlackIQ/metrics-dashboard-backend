// ----------------------------------------------
// $app/routes/host
// host.routes.js
// ----------------------------------------------
// Host Routes.
// All routes of host crud.

import express from "express";

import { Host } from "$app/controllers/index.js";

import { resourceOwnership } from "$app/middlewares/index.js";

const router = express.Router();

router.get("/", Host.ALL);
router.post("/", Host.CREATE);
router.get("/:id", resourceOwnership("Host"), Host.SINGLE);
router.delete("/:id", resourceOwnership("Host"), Host.DELETE);
router.patch("/:id", resourceOwnership("Host"), Host.UPDATE);
router.post("/check", Host.CHECK);

export default router;
