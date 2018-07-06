export function isLoggedIn(req, res, next) {
  if (!req.user) {
    return res.status(401).json({});
  }
  return next();
}


