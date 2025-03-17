import Joi from "joi";

export const alertSchema = Joi.object({
  type: Joi.string().valid("email", "telegram").required().messages({
    "any.only": "Type must be either 'email' or 'telegram'",
    "any.required": "Type is required",
  }),
  config: Joi.object({
    chatID: Joi.string().when("$type", {
      is: "telegram",
      then: Joi.required().messages({
        "any.required": "chatID is required for Telegram alerts",
      }),
    }),
    botToken: Joi.string().when("$type", {
      is: "telegram",
      then: Joi.required().messages({
        "any.required": "botToken is required for Telegram alerts",
      }),
    }),
    destinationEmail: Joi.string()
      .email()
      .when("$type", {
        is: "email",
        then: Joi.required().messages({
          "any.required": "destinationEmail is required for Email alerts",
          "string.email": "destinationEmail must be a valid email address",
        }),
      }),
  })
    .required()
    .messages({
      "any.required": "Config is required",
    }),
});

export const alertUpdateSchema = alertSchema.fork(
  ["type", "config", "isActive"],
  (field) => field.optional()
);

export const alertParamsSchema = Joi.object({
  id: Joi.string().hex().length(24).required().messages({
    "string.hex": "ID must be a valid ObjectId",
    "string.length": "ID must be 24 characters",
    "any.required": "ID is required",
  }),
});
