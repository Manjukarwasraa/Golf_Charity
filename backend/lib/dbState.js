let mongoReady = false;

const setMongoReady = (value) => {
  mongoReady = value;
};

const isMongoReady = () => mongoReady;

module.exports = {
  setMongoReady,
  isMongoReady,
};
