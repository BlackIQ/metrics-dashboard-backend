import Joi from "joi";

const validate =
  ({ bodySchema, paramsSchema, querySchema }) =>
  (req, res, next) => {
    if (bodySchema) {
      const { error: bodyError } = bodySchema.validate(req.body, {
        abortEarly: false,
      });
      if (bodyError) {
        return res.status(400).json({
          message: "Body validation failed",
          errors: bodyError.details.map((d) => d.message),
        });
      }
    }

    if (paramsSchema) {
      const { error: paramsError } = paramsSchema.validate(req.params, {
        abortEarly: false,
      });
      if (paramsError) {
        return res.status(400).json({
          message: "Params validation failed",
          errors: paramsError.details.map((d) => d.message),
        });
      }
    }

    if (querySchema) {
      const { error: queryError, value } = querySchema.validate(req.query, {
        abortEarly: false,
      });
      if (queryError) {
        return res.status(400).json({
          message: "Query validation failed",
          errors: queryError.details.map((d) => d.message),
        });
      }
    }

    next();
  };

export default validate;
