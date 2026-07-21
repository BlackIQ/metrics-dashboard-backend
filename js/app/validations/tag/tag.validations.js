import Joi from "joi";

export const tagSchema = Joi.object({
  label: Joi.string().min(1).max(100).required().messages({
    "string.empty": "Label cannot be empty",
    "string.min": "Label must be at least 1 character",
    "string.max": "Label cannot exceed 100 characters",
    "any.required": "Label is required",
  }),
});

export const tagUpdateSchema = tagSchema.fork(["label"], (field) =>
  field.optional()
);

export const tagParamsSchema = Joi.object({
  id: Joi.string().hex().length(24).required().messages({
    "string.hex": "ID must be a valid ObjectId",
    "string.length": "ID must be 24 characters",
    "any.required": "ID is required",
  }),
});
