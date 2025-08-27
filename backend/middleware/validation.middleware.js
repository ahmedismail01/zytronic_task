const z = require("zod");
const handleResponse = require("../utils/handleResponse");

module.exports = validateData = (schema) => {
  return (req, res, next) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessages = error.issues.map((issue) => ({
          message: `${issue.message}`,
        }));
        handleResponse.success(res, "Invalid data", errorMessages, 400);
      } else {
        handleResponse.failer(res, "Internal Server Error", [], 500);
      }
    }
  };
};
