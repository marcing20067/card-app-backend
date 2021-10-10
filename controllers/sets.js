const Set = require('../models/set');
const messages = require('../messages/messages');
const MongoError = require('../util/mongoError');

exports.getSets = async (req, res, next) => {
    const userId = req.userData.id;

    try {
        const findedSets = await Set.find({ creator: userId });
        res.send(findedSets)
    } catch {
        res.status(400).send({ message: messages.global.invalidData })
    }
}

exports.getSet = async (req, res, next) => {
    const userId = req.userData.id;
    const setId = req.params.setId;

    try {
        const filterData = { _id: setId, creator: userId };
        const findedSet = await Set.findOne(filterData);
        res.send(findedSet);
    } catch {
        res.status(400).send({ message: messages.global.invalidData })
    }
}

exports.deleteSet = async (req, res, next) => {
    const userId = req.userData.id;
    const setId = req.params.setId;

    try {
        await Set.deleteOne({ _id: setId, creator: userId })
        res.send({})
    } catch {
        res.status(400).send({ message: messages.global.invalidData })
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
    catch (error) {
        const mongoError = new MongoError(error);
        const message = mongoError.getMessage();
        res.status(400).send({ message: message || messages.global.invalidData })
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
        const addedSet = await newSet.save();
        res.status(201).send(addedSet);
    } catch (error) {
        const mongoError = new MongoError(error);
        const message = mongoError.getMessage();
        res.status(400).send({ message: message || messages.global.invalidData });
    }
}