const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "golf-charity-dev-secret";

module.exports = function auth(req, res, next) {
  const authHeader = req.header("Authorization");

  if (!authHeader) {
    return res.status(401).json({ msg: "Authentication token is required." });
  }

  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : authHeader;

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ msg: "Invalid or expired token." });
  }
};
