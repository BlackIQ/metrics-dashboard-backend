import express from "express";

import { OAuth } from "$app/controllers/index.js";

const router = express.Router();

router.post("/google", OAuth.GOOGLE_LOGIN);
router.post("/facebook", OAuth.FACEBOOK_LOGIN);
router.post("/microsoft", OAuth.MICROSOFT_LOGIN);
router.post("/github", OAuth.GITHUB_LOGIN);

export default router;
