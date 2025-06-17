exports.errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: err.message || 'Validation Error',
      errors: err.details || Object.values(err.errors).map(e => ({
        field: e.path,
        message: e.message
      }))
    });
  }
    
  res.status(500).json({ 
    success: false,
    message: 'Internal server error' 
  });
};