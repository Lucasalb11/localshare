// Stub module for pino-pretty to prevent build errors
// pino-pretty is an optional dependency that's not needed in production
module.exports = function() {
  return function() {
    // No-op function
  };
};

