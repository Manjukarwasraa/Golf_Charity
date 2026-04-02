const Score = require("../models/Score");
const { isMongoReady } = require("../lib/dbState");
const { getScoresByUser } = require("../lib/localStore");

const runDraw = async (req, res) => {
  let drawNumbers = [];

  while (drawNumbers.length < 5) {
    let num = Math.floor(Math.random() * 45) + 1;
    if (!drawNumbers.includes(num)) drawNumbers.push(num);
  }

  const scores = isMongoReady()
    ? await Score.find({ userId: req.user.id })
    : getScoresByUser(req.user.id);
  const userScores = scores.map(s => s.score);

  const matches = drawNumbers.filter(num =>
    userScores.includes(num)
  ).length;

  res.json({
    drawNumbers,
    userScores,
    matches,
    message:
      matches > 0
        ? `You matched ${matches} number${matches > 1 ? "s" : ""}.`
        : "No matches this round, but your next draw could be the one.",
  });
};

module.exports = { runDraw };
