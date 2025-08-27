// Export all validation schemas
const authValidations = require("./auth.validation");
const messageValidations = require("./message.validation");

module.exports = {
  ...authValidations,
  ...messageValidations,
};
