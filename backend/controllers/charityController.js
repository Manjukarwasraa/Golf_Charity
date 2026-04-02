const Charity = require("../models/Charity");
const User = require("../models/User");
const { isMongoReady } = require("../lib/dbState");
const {
  findCharityByName,
  getCharities: getLocalCharities,
  sanitizeUser,
  updateUser,
} = require("../lib/localStore");

const getCharities = async (req, res) => {
  const data = isMongoReady()
    ? await Charity.find().sort({ name: 1 })
    : getLocalCharities();
  res.json(data);
};

const selectCharity = async (req, res) => {
  const { charity } = req.body;

  if (!charity) {
    return res.status(400).json({ msg: "Please choose a charity." });
  }

  const existingCharity = isMongoReady()
    ? await Charity.findOne({ name: charity })
    : findCharityByName(charity);

  if (!existingCharity) {
    return res.status(404).json({ msg: "Selected charity was not found." });
  }

  const user = isMongoReady()
    ? await User.findByIdAndUpdate(
        req.user.id,
        { charity: existingCharity.name },
        { new: true }
      ).select("-password")
    : sanitizeUser(updateUser(req.user.id, { charity: existingCharity.name }));

  res.json({ msg: "Charity selected successfully.", user });
};

module.exports = { getCharities, selectCharity };
