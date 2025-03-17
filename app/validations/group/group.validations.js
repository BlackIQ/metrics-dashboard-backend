import Joi from "joi";

export const groupSchema = Joi.object({
  label: Joi.string().min(1).max(100).required().messages({
    "string.empty": "Label cannot be empty",
    "string.min": "Label must be at least 1 character",
    "string.max": "Label cannot exceed 100 characters",
    "any.required": "Label is required",
  }),
  value: Joi.string().min(1).max(100).required().messages({
    "string.empty": "Value cannot be empty",
    "string.min": "Value must be at least 1 character",
    "string.max": "Value cannot exceed 100 characters",
    "any.required": "Value is required",
  }),
});

export const groupUpdateSchema = groupSchema.fork(["label", "value"], (field) =>
  field.optional()
);
