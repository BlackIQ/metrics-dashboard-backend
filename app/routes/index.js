// ----------------------------------------------
// $app/routes
// index.js
// ----------------------------------------------
// Exporting all API routes.
// Like auth, user, permission and stuff.

import express from "express";

import Auth from "$app/routes/auth/auth.routes.js";
import OAuth from "$app/routes/auth/oauth.routes.js";
import Permission from "$app/routes/permission/permission.routes.js";
import Role from "$app/routes/role/role.routes.js";
import User from "$app/routes/user/user.routes.js";
import Host from "$app/routes/host/host.routes.js";
import Metric from "$app/routes/metric/metric.routes.js";
import Tag from "$app/routes/tag/tag.routes.js";
import Group from "$app/routes/group/group.routes.js";
import Ping from "$app/routes/ping/ping.routes.js";
import Alert from "$app/routes/alert/alert.routes.js";
import Trigger from "$app/routes/trigger/trigger.routes.js";

import { jwt } from "$app/middlewares/index.js";

const router = express.Router();

router.use("/auth", Auth);
router.use("/oauth", OAuth);
router.use("/permissions", jwt, Permission);
router.use("/triggers", jwt, Trigger);
router.use("/metrics", jwt, Metric);
router.use("/groups", jwt, Group);
router.use("/alerts", jwt, Alert);
router.use("/roles", jwt, Role);
router.use("/users", jwt, User);
router.use("/hosts", jwt, Host);
router.use("/tags", jwt, Tag);
router.use("/ping", Ping);

export default router;
