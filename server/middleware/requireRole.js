/**
 * requireRole(...roles)
 * Factory that returns an Express middleware restricting access
 * to users whose role is in the allowed list.
 *
 * Usage:
 *   router.post("/", auth, requireRole("admin"), handler)
 *   router.patch("/", auth, requireRole("admin", "asset_manager"), handler)
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role(s): ${roles.join(", ")}.`,
      });
    }

    next();
  };
};

export default requireRole;
