const allowRoles = (...allowedRoles) => {
  return (req, res, next) => {
    const user = req.user;  // Assumes `req.user` is already set by authentication middleware

    if (!user) {
      return res.status(401).json({ message: 'Unauthorized: User not authenticated' });
    }

    if (!allowedRoles.includes(user.role)) {
      return res.status(403).json({ message: `Forbidden: Requires role(s): ${allowedRoles.join(', ')}` });
    }
    next(); 
  };
};

export default allowRoles;
