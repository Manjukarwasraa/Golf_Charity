const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { isMongoReady } = require("../lib/dbState");
const {
  createUser,
  findUserByEmail,
  findUserById,
  sanitizeUser,
} = require("../lib/localStore");

const JWT_SECRET = process.env.JWT_SECRET || "golf-charity-dev-secret";

const signup = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ msg: "Name, email, and password are required." });
  }

  if (password.length < 6) {
    return res.status(400).json({ msg: "Password must be at least 6 characters." });
  }

  const normalizedEmail = email.trim().toLowerCase();

  const existing = isMongoReady()
    ? await User.findOne({ email: normalizedEmail })
    : findUserByEmail(normalizedEmail);
  if (existing) return res.status(400).json({ msg: "An account with this email already exists." });

  const hashed = await bcrypt.hash(password, 10);

  const user = isMongoReady()
    ? await User.create({
        name: name.trim(),
        email: normalizedEmail,
        password: hashed,
      })
    : createUser({
        name: name.trim(),
        email: normalizedEmail,
        password: hashed,
      });

  const userId = user._id ? user._id.toString() : user.id;
  const token = jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: "7d" });

  res.status(201).json({
    msg: "Registered successfully.",
    token,
    user: {
      id: userId,
      name: user.name,
      email: user.email,
      charity: user.charity,
      subscriptionStatus: user.subscriptionStatus,
    },
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ msg: "Email and password are required." });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const user = isMongoReady()
    ? await User.findOne({ email: normalizedEmail })
    : findUserByEmail(normalizedEmail);

  if (!user) return res.status(400).json({ msg: "User not found." });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ msg: "Incorrect password." });

  const userId = user._id ? user._id.toString() : user.id;
  const token = jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: "7d" });

  res.json({
    token,
    user: {
      id: userId,
      name: user.name,
      email: user.email,
      charity: user.charity,
      subscriptionStatus: user.subscriptionStatus,
    },
  });
};

const getCurrentUser = async (req, res) => {
  const user = isMongoReady()
    ? await User.findById(req.user.id).select("-password")
    : sanitizeUser(findUserById(req.user.id));

  if (!user) {
    return res.status(404).json({ msg: "User not found." });
  }

  res.json(user);
};

module.exports = { signup, login, getCurrentUser };
