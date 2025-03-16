// ----------------------------------------------
// $app/config/email
// email.config.js
// ----------------------------------------------
// Email configurations.
// Here we export enail data.

import env from "$app/env/index.js";

export default {
  endpoint: env.EMAIL_ENDPOINT,
  port: env.EMAIL_PORT,
  username: env.EMAIL_USERNAME,
  password: env.EMAIL_PASSWORD,
};
