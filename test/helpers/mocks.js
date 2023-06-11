const OneTimeToken = require("../../models/oneTimeToken");
const Set = require("../../models/set");
const User = require("../../models/user");
const JWT_MOCK_USER_ID = "5349b4ddd2781d08c09890f3";

const userObj = {
  username: "admin",
  password: "password",
  email: "email@mail.pl",
  isActivated: true,
};

const userObj2 = {
  username: "adminSecond",
  password: "password2",
  email: "email2@mail.pl",
  isActivated: true,
};

const setObj = {
  name: "name",
  cards: [
    {
      concept: "concept",
      definition: "definition",
      group: 1,
    },
  ],
  stats: {
    group1: 1,
    group2: 0,
    group3: 0,
    group4: 0,
    group5: 0,
  },
  creator: "creator",
};

const createSet = async (customData = {}) => {
  const set = new Set({
    ...setObj,
    creator: JWT_MOCK_USER_ID,
    ...customData,
  });
  const createdSet = await set.save();
  return createdSet._doc;
};

const createUser = async (customData = {}) => {
  const user = new User({
    _id: JWT_MOCK_USER_ID,
    ...userObj,
    ...customData,
  });
  const createdUser = await user.save();
  return createdUser._doc;
};

const   createOneTimeToken = async (customData = {}) => {
  const oneTimeToken = new OneTimeToken({
    creator: JWT_MOCK_USER_ID,
    ...customData,
  });
  const createdOneTimeToken = await oneTimeToken.save();
  return createdOneTimeToken._doc;
};

module.exports = {
  setObj,
  userObj,
  userObj2,
  JWT_MOCK_USER_ID,
  createSet,
  createUser,
  createOneTimeToken
};
