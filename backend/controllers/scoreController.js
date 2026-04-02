const Score = require("../models/Score");
const { isMongoReady } = require("../lib/dbState");
const { addScore: addLocalScore, getScoresByUser } = require("../lib/localStore");

const addScore = async (req, res) => {
  const { score } = req.body;
  const parsedScore = Number(score);

  if (!Number.isInteger(parsedScore) || parsedScore < 1 || parsedScore > 45) {
    return res.status(400).json({ msg: "Score must be a whole number between 1 and 45." });
  }

  if (isMongoReady()) {
    const newScore = new Score({
      userId: req.user.id,
      score: parsedScore,
      date: new Date(),
    });

    await newScore.save();

    const scores = await Score.find({ userId: req.user.id }).sort({ date: -1 });

    if (scores.length > 5) {
      await Score.findByIdAndDelete(scores[5]._id);
    }
  } else {
    addLocalScore(req.user.id, parsedScore);
  }
  res.status(201).json({ msg: "Score added successfully." });
};

const getScores = async (req, res) => {
  const scores = isMongoReady()
    ? await Score.find({ userId: req.user.id }).sort({ date: -1 })
    : getScoresByUser(req.user.id);
  res.json(scores);
};

module.exports = { addScore, getScores };
