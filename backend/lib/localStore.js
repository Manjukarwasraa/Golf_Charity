const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const DATA_FILE = path.join(__dirname, "..", "data", "localdb.json");
const DEFAULT_CHARITIES = [
  {
    id: crypto.randomUUID(),
    name: "First Tee Youth Fund",
    description: "Expands access to golf, mentorship, and life-skills coaching for young players.",
  },
  {
    id: crypto.randomUUID(),
    name: "Greens for Good Foundation",
    description: "Supports local families through emergency grants and community wellness programs.",
  },
  {
    id: crypto.randomUUID(),
    name: "Fairway Futures Trust",
    description: "Funds junior sports scholarships and school-based recreation initiatives.",
  },
];

function ensureStore() {
  const directory = path.dirname(DATA_FILE);

  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }

  if (!fs.existsSync(DATA_FILE)) {
    const initialData = {
      users: [],
      scores: [],
      charities: DEFAULT_CHARITIES,
    };

    fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2));
  }
}

function readStore() {
  ensureStore();
  const raw = fs.readFileSync(DATA_FILE, "utf8");
  const parsed = JSON.parse(raw);

  if (!Array.isArray(parsed.charities) || parsed.charities.length === 0) {
    parsed.charities = DEFAULT_CHARITIES;
    writeStore(parsed);
  }

  return parsed;
}

function writeStore(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

function createId() {
  return crypto.randomUUID();
}

function sanitizeUser(user) {
  if (!user) {
    return null;
  }

  const { password, ...safeUser } = user;
  return safeUser;
}

function findUserByEmail(email) {
  const store = readStore();
  return store.users.find((user) => user.email === email) || null;
}

function findUserById(id) {
  const store = readStore();
  return store.users.find((user) => user.id === id) || null;
}

function createUser(userData) {
  const store = readStore();
  const user = {
    id: createId(),
    charity: "",
    subscriptionStatus: "inactive",
    ...userData,
  };

  store.users.push(user);
  writeStore(store);
  return user;
}

function updateUser(id, updates) {
  const store = readStore();
  const userIndex = store.users.findIndex((user) => user.id === id);

  if (userIndex === -1) {
    return null;
  }

  store.users[userIndex] = {
    ...store.users[userIndex],
    ...updates,
  };

  writeStore(store);
  return store.users[userIndex];
}

function getCharities() {
  const store = readStore();
  return [...store.charities].sort((a, b) => a.name.localeCompare(b.name));
}

function findCharityByName(name) {
  const store = readStore();
  return store.charities.find((charity) => charity.name === name) || null;
}

function addScore(userId, score) {
  const store = readStore();
  const entry = {
    id: createId(),
    userId,
    score,
    date: new Date().toISOString(),
  };

  store.scores.push(entry);

  const userScores = store.scores
    .filter((item) => item.userId === userId)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  if (userScores.length > 5) {
    const idsToKeep = new Set(userScores.slice(0, 5).map((item) => item.id));
    store.scores = store.scores.filter(
      (item) => item.userId !== userId || idsToKeep.has(item.id)
    );
  }

  writeStore(store);
  return entry;
}

function getScoresByUser(userId) {
  const store = readStore();

  return store.scores
    .filter((item) => item.userId === userId)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .map((item) => ({
      _id: item.id,
      userId: item.userId,
      score: item.score,
      date: item.date,
    }));
}

module.exports = {
  addScore,
  createUser,
  findCharityByName,
  findUserByEmail,
  findUserById,
  getCharities,
  getScoresByUser,
  sanitizeUser,
  updateUser,
};
