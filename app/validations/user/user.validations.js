import Joi from "joi";

export const userSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Email must be a valid email address",
    "any.required": "Email is required",
  }),
  password: Joi.string().min(8).max(128).required().messages({
    "string.min": "Password must be at least 8 characters",
    "string.max": "Password cannot exceed 128 characters",
    "any.required": "Password is required",
  }),
  firstName: Joi.string().min(1).max(50).allow("").messages({
    "string.min": "First name must be at least 1 character",
    "string.max": "First name cannot exceed 50 characters",
  }),
  lastName: Joi.string().min(1).max(50).allow("").messages({
    "string.min": "Last name must be at least 1 character",
    "string.max": "Last name cannot exceed 50 characters",
  }),
});

export const userUpdateSchema = userSchema.fork(
  ["email", "firstName", "lastName"],
  (field) => field.optional()
);

export const userPasswordSchema = Joi.object({
  password: Joi.string().min(8).max(128).required().messages({
    "string.min": "Password must be at least 8 characters",
    "string.max": "Password cannot exceed 128 characters",
    "any.required": "Password is required",
  }),
});

export const userParamsSchema = Joi.object({
  id: Joi.string().hex().length(24).required().messages({
    "string.hex": "ID must be a valid ObjectId",
    "string.length": "ID must be 24 characters",
    "any.required": "ID is required",
  }),
});
