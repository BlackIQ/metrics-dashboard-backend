import Joi from "joi";

export const hostSchema = Joi.object({
  name: Joi.string().min(1).max(255).required().messages({
    "string.empty": "Name cannot be empty",
    "string.min": "Name must be at least 1 character",
    "string.max": "Name cannot exceed 255 characters",
    "any.required": "Name is required",
  }),
  details: Joi.string().allow("").max(500).messages({
    "string.max": "Details cannot exceed 500 characters",
  }),
  ip: Joi.string()
    .pattern(/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/)
    .allow("")
    .messages({
      "string.pattern.base": "IP must be a valid IPv4 address",
    }),
  dns: Joi.string()
    .pattern(/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
    .allow("")
    .messages({
      "string.pattern.base": "DNS must be a valid domain name",
    }),
  port: Joi.string()
    .pattern(/^\d{1,5}$/)
    .default("80")
    .messages({
      "string.pattern.base": "Port must be a number between 1 and 65535",
    }),
  apiKey: Joi.string().required().messages({
    "any.required": "API Key is required",
  }),
  ipCommunication: Joi.boolean().messages({
    "boolean.base": "ipCommunication must be a boolean",
  }),
  agentAvailable: Joi.boolean().messages({
    "boolean.base": "agentAvailable must be a boolean",
  }),
  dockerMetrics: Joi.boolean().messages({
    "boolean.base": "dockerMetrics must be a boolean",
  }),
  isActive: Joi.boolean().messages({
    "boolean.base": "isActive must be a boolean",
  }),
  groups: Joi.array().items(
    Joi.string().hex().length(24).messages({
      "string.hex": "Group ID must be a valid ObjectId",
      "string.length": "Group ID must be 24 characters",
    })
  ),
  tags: Joi.array().items(
    Joi.string().hex().length(24).messages({
      "string.hex": "Tag ID must be a valid ObjectId",
      "string.length": "Tag ID must be 24 characters",
    })
  ),
});

export const hostUpdateSchema = hostSchema.fork(
  [
    "name",
    "details",
    "ip",
    "dns",
    "port",
    "apiKey",
    "ipCommunication",
    "agentAvailable",
    "dockerMetrics",
    "isActive",
    "groups",
    "tags",
  ],
  (field) => field.optional()
);

export const hostParamsSchema = Joi.object({
  id: Joi.string().hex().length(24).required().messages({
    "string.hex": "ID must be a valid ObjectId",
    "string.length": "ID must be 24 characters",
    "any.required": "ID is required",
  }),
});

export const hostCheckSchema = Joi.object({
  host: Joi.object({
    ip: Joi.string()
      .pattern(/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/)
      .allow("")
      .messages({
        "string.pattern.base": "IP must be a valid IPv4 address",
      }),
    dns: Joi.string()
      .pattern(/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
      .allow("")
      .messages({
        "string.pattern.base": "DNS must be a valid domain name",
      }),
    port: Joi.number().integer().min(1).max(65535).default(80).messages({
      "number.base": "Port must be a number",
      "number.integer": "Port must be an integer",
      "number.min": "Port must be at least 1",
      "number.max": "Port cannot exceed 65535",
    }),
    ipCommunication: Joi.boolean().default(false).messages({
      "boolean.base": "ipCommunication must be a boolean",
    }),
  })
    .required()
    .or("ip", "dns")
    .messages({
      "any.required": "Host object is required",
      "object.or": "Either ip or dns must be provided",
    }),
});
