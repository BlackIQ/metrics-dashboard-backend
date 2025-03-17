const superuserOnly = (req, res, next) => {
  if (req.user.role !== "superuser") {
    return res.status(403).json({ message: "Forbidden: Superuser only" });
  }

  next();
};

export default superuserOnly;
