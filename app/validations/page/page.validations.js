import Joi from "joi";

export const pageSchema = Joi.object({
  title: Joi.string().min(1).max(100).required().messages({
    "string.empty": "Title cannot be empty",
    "string.min": "Title must be at least 1 character",
    "string.max": "Title cannot exceed 100 characters",
    "any.required": "Title is required",
  }),
  description: Joi.string().min(1).max(500).optional().messages({
    "string.empty": "Description cannot be empty",
    "string.min": "Description must be at least 1 character",
    "string.max": "Description cannot exceed 500 characters",
  }),
});

export const pageUpdateSchema = pageSchema.fork(
  ["title", "description"],
  (field) => field.optional()
);

export const pageParamsSchema = Joi.object({
  id: Joi.string().hex().length(24).required().messages({
    "string.hex": "ID must be a valid ObjectId",
    "string.length": "ID must be 24 characters",
    "any.required": "ID is required",
  }),
});
