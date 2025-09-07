const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

const errorHandler = (err, req, res, next) => {
  console.error('Erro:', err.message);
  res.status(500).json({
    success: false,
    message: err.message || 'Erro interno do servidor'
  });
};

module.exports = { asyncHandler, errorHandler };
