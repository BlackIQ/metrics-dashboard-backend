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

export { Role, User, Permission, Host };
