// ----------------------------------------------
// $app/models
// index.js
// ----------------------------------------------
// Exporting all databse models.
// Like Role, User and etc...

import Role from "$app/models/role/role.model.js";
import User from "$app/models/user/user.model.js";
import Permission from "$app/models/permission/permission.model.js";
import Host from "$app/models/host/host.model.js";
import Tag from "$app/models/tag/tag.model.js";
import Group from "$app/models/group/group.model.js";
import Alert from "$app/models/alert/alert.model.js";
import AgentAction from "$app/models/action/action.model.js";
import Trigger from "$app/models/trigger/trigger.model.js";
import TriggerLog from "$app/models/triggerlog/triggerlog.model.js";
import Page from "$app/models/page/page.model.js";
import Graph from "$app/models/graph/graph.model.js";

export {
  Role,
  User,
  Permission,
  Host,
  Tag,
  Group,
  Alert,
  AgentAction,
  Trigger,
  TriggerLog,
  Page,
  Graph,
};
