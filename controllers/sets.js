const Set = require('../models/set');
const MongoError = require('../util/mongoError');
const throwError = require('../util/throwError');

exports.getSets = async (req, res, next) => {
    const userId = req.userData.id;
    const fields = req.query.fields;
    try {
        const findedSets = await Set.find({ creator: userId }).select(fields);
        res.send(findedSets)
    } catch(err) {
        next(err)
    }
}

exports.getSet = async (req, res, next) => {
    const userId = req.userData.id;
    const setId = req.params.setId;

    try {
        const findedSet = await Set.findOne({ _id: setId, creator: userId });
        if(!findedSet) {
            throwError()
        }
        res.send(findedSet);
    } catch(err) {
        const mongoError = new MongoError(err);
        if(mongoError.isValidationError()) {
            err.statusCode = 400
            err.errorMessage = mongoError.getMessage();
        }

        next(err)
    }
}

exports.deleteSet = async (req, res, next) => {
    const userId = req.userData.id;
    const setId = req.params.setId;
    try {
        await Set.deleteOne({ _id: setId, creator: userId })
        res.send({})
    } catch(err) {
        const mongoError = new MongoError(err);
        if(mongoError.isValidationError()) {
            err.statusCode = 400
            err.errorMessage = mongoError.getMessage();
        }
        next(err)
    }
}

exports.updateSet = async (req, res, next) => {
    const userId = req.userData.id;
    const setId = req.params.setId;

    const newSet = {
        name: req.body.name,
        cards: req.body.cards,
        stats: req.body.stats,
        creator: userId
    };

    try {
        const updateData = await Set.updateOne({ _id: setId, creator: userId }, { $set: newSet }, { runValidators: true });
        res.send({ ...newSet, _id: setId });
    }
    catch (err) {
        const mongoError = new MongoError(err);
        if(mongoError.isValidationError()) {
            err.statusCode = 400;
            err.errorMessage = mongoError.getMessage();
        }
        next(err)
    }
}

exports.addSet = async (req, res, next) => {
    const userId = req.userData.id;
    const set = {
        name: req.body.name,
        cards: req.body.cards,
        stats: req.body.stats,
        creator: userId
    };

    try {
        const newSet = new Set(set);
        const createdSet = await newSet.save();
        res.status(201).send(createdSet);
    } catch (err) {
        const mongoError = new MongoError(err);
        if(mongoError.isValidationError()) {
            err.statusCode = 400
            err.errorMessage = mongoError.getMessage();
        }
        next(err)
    }
}