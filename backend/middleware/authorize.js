/**
 * Role-based access control middleware.
 * Usage: authorize('admin') or authorize('admin', 'member')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated.',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Role '${req.user.role}' is not authorized for this action.`,
      });
    }

    next();
  };
};

/**
 * Middleware to ensure the requesting user owns the resource OR is an admin.
 * Usage: authorizeOwnerOrAdmin('userId') — pass the param name holding the resource owner ID.
 */
const authorizeOwnerOrAdmin = (paramName = 'id') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated.' });
    }

    const resourceId = req.params[paramName];
    const isOwner = req.user._id.toString() === resourceId;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only modify your own resources.',
      });
    }

    next();
  };
};

module.exports = { authorize, authorizeOwnerOrAdmin };
