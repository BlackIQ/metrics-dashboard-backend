// ----------------------------------------------
// $app/routes/alert
// alert.routes.js
// ----------------------------------------------
// Alert Routes.
// All routes of alert stuff.

import express from "express";

import { Alert } from "$app/controllers/index.js";

const router = express.Router();

router.get("/", Alert.ALL);
router.post("/", Alert.CREATE);
router.patch("/:id", Alert.UPDATE);
router.delete("/:id", Alert.DELETE);
router.post("/test", Alert.TEST_ALERT);

export default router;
