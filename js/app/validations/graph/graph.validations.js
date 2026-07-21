import Joi from "joi";

export const graphSchema = Joi.object({
  page: Joi.string().hex().length(24).required().messages({
    "string.hex": "Page ID must be a valid ObjectId",
    "string.length": "Page ID must be 24 characters",
    "any.required": "Page ID is required",
  }),
  host: Joi.string().hex().length(24).optional().messages({
    "string.hex": "Host ID must be a valid ObjectId",
    "string.length": "Host ID must be 24 characters",
  }),
  measurement: Joi.string().min(1).max(100).required().messages({
    "string.empty": "Measurement cannot be empty",
    "string.min": "Measurement must be at least 1 character",
    "string.max": "Measurement cannot exceed 100 characters",
    "any.required": "Measurement is required",
  }),
  fields: Joi.array()
    .items(Joi.string().min(1).max(50))
    .min(1)
    .required()
    .messages({
      "array.min": "Fields must contain at least one item",
      "string.empty": "Field names cannot be empty",
      "string.min": "Field names must be at least 1 character",
      "string.max": "Field names cannot exceed 50 characters",
      "any.required": "Fields are required",
    }),
  title: Joi.string().min(1).max(100).required().messages({
    "string.empty": "Title cannot be empty",
    "string.min": "Title must be at least 1 character",
    "string.max": "Title cannot exceed 100 characters",
    "any.required": "Title is required",
  }),
  chart: Joi.string().valid("AreaChart", "LineChart").required().messages({
    "any.only": "Chart must be one of: AreaChart, LineChart, BarChart",
    "any.required": "Chart type is required",
  }),
  colors: Joi.object()
    .pattern(Joi.string(), Joi.string().regex(/^#[0-9A-Fa-f]{6}$/))
    .optional()
    .messages({
      "object.pattern.match":
        "Colors must map field names to valid hex codes (e.g., #ff0000)",
      "string.pattern.base":
        "Each color value must be a valid hex code starting with # (e.g., #ff0000)",
    }),
});

export const graphUpdateSchema = graphSchema.fork(
  ["page", "host", "measurement", "fields", "title", "chart", "colors"],
  (field) => field.optional()
);

export const graphIdParamsSchema = Joi.object({
  id: Joi.string().hex().length(24).required().messages({
    "string.hex": "ID must be a valid ObjectId",
    "string.length": "ID must be 24 characters",
    "any.required": "ID is required",
  }),
});

export const graphParamsSchema = Joi.object({
  page: Joi.string().hex().length(24).required().messages({
    "string.hex": "Page ID must be a valid ObjectId",
    "string.length": "Page ID must be 24 characters",
    "any.required": "Page ID is required",
  }),
});
