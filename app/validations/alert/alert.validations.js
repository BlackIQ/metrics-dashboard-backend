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
  isActive: Joi.boolean().required().messages({
    "any.required": "isActive is required",
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

export const alertTestSchema = Joi.object({
  type: Joi.string().valid("telegram", "email").required().messages({
    "any.only": "Type must be either 'telegram' or 'email'",
    "any.required": "Type is required",
  }),
  config: Joi.object({
    chatID: Joi.string().when("$type", {
      is: "telegram",
      then: Joi.required().messages({
        "any.required": "chatID is required for Telegram test",
      }),
      otherwise: Joi.forbidden().messages({
        "any.forbidden": "chatID is only allowed for Telegram",
      }),
    }),
    botToken: Joi.string().when("$type", {
      is: "telegram",
      then: Joi.required().messages({
        "any.required": "botToken is required for Telegram test",
      }),
      otherwise: Joi.forbidden().messages({
        "any.forbidden": "botToken is only allowed for Telegram",
      }),
    }),
    destinationEmail: Joi.string()
      .email()
      .when("$type", {
        is: "email",
        then: Joi.required().messages({
          "any.required": "destinationEmail is required for Email test",
          "string.email": "destinationEmail must be a valid email address",
        }),
        otherwise: Joi.forbidden().messages({
          "any.forbidden": "destinationEmail is only allowed for Email",
        }),
      }),
  })
    .required()
    .messages({
      "any.required": "Config is required",
    }),
});
