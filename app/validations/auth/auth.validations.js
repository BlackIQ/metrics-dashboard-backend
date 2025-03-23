import Joi from "joi";

export const authLoginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Email must be a valid email address",
    "any.required": "Email is required",
  }),
  password: Joi.string().min(6).required().messages({
    "string.min": "Password must be at least 6 characters",
    "any.required": "Password is required",
  }),
  remember: Joi.boolean().optional().default(false).messages({
    "boolean.base": "Remember me must be true or false",
  }),
});

export const authRegisterSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Email must be a valid email address",
    "any.required": "Email is required",
  }),
  password: Joi.string().min(6).required().messages({
    "string.min": "Password must be at least 6 characters",
    "any.required": "Password is required",
  }),
  firstName: Joi.string().max(50).required().messages({
    "string.max": "First name cannot exceed 50 characters",
    "any.required": "First name is required",
  }),
  lastName: Joi.string().max(50).optional().messages({
    "string.max": "Last name cannot exceed 50 characters",
  }),
});

export const authConfirmSchema = Joi.object({
  rayid: Joi.string().length(50).required().messages({
    "string.length": "RayID must be 50 characters",
    "any.required": "RayID is required",
  }),
});

export const authResendConfirmSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Email must be a valid email address",
    "any.required": "Email is required",
  }),
});
