const Set = require('../models/set');
const messages = require('../messages/messages');
const MongoError = require('../util/mongoError');
exports.getSets = async (req, res, next) => {
    const userId = req.userData.id;
    try {
        const findedSets = await Set.find({ creator: userId });
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
            const err = new Error(messages.global.invalidData);
            err.statusCode = 400;
            throw err;
        }
        res.send(findedSet);
    } catch(err) {
        const mongoError = new MongoError(err);
        if(mongoError.isValidationError()) {
            const message = mongoError.getMessage();
            err.statusCode = 400
            err.message = message;
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
            const message = mongoError.getMessage();
            err.statusCode = 400
            err.message = message;
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
            const message = mongoError.getMessage();
            err.statusCode = 400;
            err.message = message;
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
            const message = mongoError.getMessage();
            err.statusCode = 400
            err.message = message;
        }
        next(err)
    }
}