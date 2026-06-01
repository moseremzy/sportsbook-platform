module.exports = (...allowedRoles) => {
    return (req, res, next) => {
      
      const admin_role = req.session.role; // get role of the admin from the session
  
      if (!allowedRoles.includes(admin_role)) {
        return res.status(403).json({
          success: false,
          message: "Access Restricted"
        });
      }
  
      next();
    };
  };