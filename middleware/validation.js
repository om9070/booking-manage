const { errorHandler } = require('./error');

exports.validate = (schema) => {
  return (req, res, next) => {
    const dataToValidate = req.method === 'GET' ? req.query : req.body;
    
    const { error } = schema.validate(dataToValidate, {
      abortEarly: false, 
      allowUnknown: false, 
      stripUnknown: false 
    });

    if (error) {
      const errors = error.details.map((err) => ({
        field: err.path.join('.'),
        message: err.message.replace(/"/g, '') 
      }));
      
      return errorHandler(
        { 
          name: 'ValidationError', 
          message: 'Validation failed',
          details: errors 
        }, 
        req, 
        res, 
        next
      );
    }

    next();
  };
};