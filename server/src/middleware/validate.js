// Validate request parts against zod schemas and replace them with parsed values
// (applies defaults and coercions). ZodErrors are formatted by the error handler.
export const validate = (schemas = {}) => (req, res, next) => {
  try {
    if (schemas.body) req.body = schemas.body.parse(req.body);
    if (schemas.query) req.query = schemas.query.parse(req.query);
    if (schemas.params) req.params = schemas.params.parse(req.params);
    next();
  } catch (err) {
    next(err);
  }
};
