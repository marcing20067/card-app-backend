const { Set } = require("../models/set");
const { MongoError } = require("../util/mongoError");
const { throwError } = require("../util/throwError");
const { messages } = require("../messages/messages");

exports.getSets = async (req, res, next) => {
  const page = +req.query.page || 1;
  const itemsPerPage = +req.query.items || 5;
  const userId = req.userData._id;
  const fields = req.query.fields || "";
  const name = req.query.name || "";
  try {
    const foundSets = await Set.find({
      creator: userId,
      name: name ? { $regex: name } : undefined,
    })
      .skip(itemsPerPage * (page - 1))
      .limit(itemsPerPage)
      .select(fields);
    res.send(foundSets);
  } catch (err) {
    next(err);
  }
};

exports.getSet = async (req, res, next) => {
  const userId = req.userData._id;
  const setId = req.params.setId;

  try {
    const foundSet = await Set.findOne({ _id: setId, creator: userId });
    if (!foundSet) {
      throwError();
    }
    res.send(foundSet);
  } catch (err) {
    const mongoError = new MongoError(err);
    const message = mongoError.getMessage();
    if (message) {
      err.statusCode = 400;
      err.errorMessage = message;
    }

    next(err);
  }
};

exports.deleteSet = async (req, res, next) => {
  const userId = req.userData._id;
  const setId = req.params.setId;
  try {
    await Set.deleteOne({ _id: setId, creator: userId });
    res.send({});
  } catch (err) {
    const mongoError = new MongoError(err);
    const message = mongoError.getMessage();
    if (message) {
      err.statusCode = 400;
      err.errorMessage = message;
    }
    next(err);
  }
};

exports.updateSet = async (req, res, next) => {
  const creator = req.userData._id;
  const setId = req.params.setId;
  const { name, cards, stats } = req.body;

  try {
    if (!name && !cards && !stats) {
      throwError();
    }

    if (name) {
      const setWithTakenName = await Set.findOne({
        _id: { $nin: [setId] },
        name,
        creator,
      });

      if (setWithTakenName) {
        throwError({
          status: 409,
          message: messages.sets.nameTaken,
        });
      }
    }

    const newSet = { name, cards, stats, creator };
    await Set.updateOne(
      { _id: setId, creator },
      { $set: newSet },
      { runValidators: true }
    );
    res.send({ ...newSet, _id: setId });
  } catch (err) {
    const mongoError = new MongoError(err);
    const message = mongoError.getMessage();
    if (message) {
      err.statusCode = 400;
      err.errorMessage = message;
    }

    next(err);
  }
};

exports.addSet = async (req, res, next) => {
  const creator = req.userData._id;
  const { name, cards, stats } = req.body;

  try {
    const newSet = new Set({ name, cards, stats, creator });
    await newSet.validate();

    if (name) {
      const setWithTakenName = await Set.findOne({
        name,
        creator,
      });
      if (setWithTakenName) {
        throwError({
          status: 409,
          message: messages.sets.nameTaken,
        });
      }
    }

    const createdSet = await newSet.save({ validateBeforeSave: false });
    res.status(201).send(createdSet);
  } catch (err) {
    const mongoError = new MongoError(err);
    const message = mongoError.getMessage();
    if (message) {
      err.statusCode = 400;
      err.errorMessage = message;
    }
    next(err);
  }
};
