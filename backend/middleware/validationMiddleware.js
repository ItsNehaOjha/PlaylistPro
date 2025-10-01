const { validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg);
    return res.status(400).json({
      message: errorMessages[0], // Return the first error message
      errors: errorMessages
    });
  }
  
  next();
};

module.exports = { handleValidationErrors };