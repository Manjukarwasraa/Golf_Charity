const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const mongoose = require("mongoose");
const Charity = require("./models/Charity");
const { setMongoReady } = require("./lib/dbState");

dotenv.config();

const app = express();
const DEFAULT_CHARITIES = [
  {
    name: "First Tee Youth Fund",
    description: "Expands access to golf, mentorship, and life-skills coaching for young players.",
  },
  {
    name: "Greens for Good Foundation",
    description: "Supports local families through emergency grants and community wellness programs.",
  },
  {
    name: "Fairway Futures Trust",
    description: "Funds junior sports scholarships and school-based recreation initiatives.",
  },
];

const seedCharities = async () => {
  const count = await Charity.countDocuments();

  if (count === 0) {
    await Charity.insertMany(DEFAULT_CHARITIES);
    console.log("Default charities seeded");
  }
};

// DB
mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 5000,
})
  .then(async () => {
    console.log("Database connected");
    setMongoReady(true);
    await seedCharities();
  })
  .catch((err) => {
    setMongoReady(false);
    console.log("MongoDB unavailable, using local file storage instead.");
    console.log(err.message);
  });


// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/scores", require("./routes/scoreRoutes"));
app.use("/api/charity", require("./routes/charityRoutes"));
app.use("/api/draw", require("./routes/drawRoutes"));

app.get("/", (req, res) => res.send("API running"));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ msg: "Something went wrong on the server." });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on ${PORT}`));
