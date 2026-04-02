const Score = require("../models/Score");
const { isMongoReady } = require("../lib/dbState");
const { addScore: addLocalScore, getScoresByUser } = require("../lib/localStore");

const getRecentScoresQuery = (userId) =>
  Score.find({ userId }).sort({ date: -1, _id: -1 }).limit(5);

const addScore = async (req, res) => {
  const { score } = req.body;
  const parsedScore = Number(score);

  if (!Number.isInteger(parsedScore) || parsedScore < 1 || parsedScore > 45) {
    return res.status(400).json({ msg: "Score must be a whole number between 1 and 45." });
  }

  if (isMongoReady()) {
    await Score.create({
      userId: req.user.id,
      score: parsedScore,
    });

    const scoresToRemove = await Score.find({ userId: req.user.id })
      .sort({ date: -1, _id: -1 })
      .skip(5)
      .select("_id");

    if (scoresToRemove.length) {
      await Score.deleteMany({
        _id: { $in: scoresToRemove.map((item) => item._id) },
      });
    }
  } else {
    addLocalScore(req.user.id, parsedScore);
  }
  res.status(201).json({ msg: "Score added successfully." });
};

const getScores = async (req, res) => {
  const scores = isMongoReady()
    ? await getRecentScoresQuery(req.user.id)
    : getScoresByUser(req.user.id);
  res.json(scores);
};

module.exports = { addScore, getScores };
