const Set = require('../models/set.js');
const isAnyPropertyUndefinedAndSendErrorByResAndObject = require('../utils/required.js')
const errorTexts = require('../errorTexts/errorTexts.js');
const isShortErrorAndSendErrorByResAndMessage = require('../utils/short.js');
const invalidDataErrorText = errorTexts.invalidData;

exports.getSets = async (req, res, next) => {
    const userId = req.userData.id;

    try {
        const findedSets = await Set.find({ creator: userId });
        res.send(findedSets)
    } catch {
        res.status(400).send({ message: invalidDataErrorText })
    }
}

exports.getSet = async (req, res, next) => {
    const userId = req.userData.id;
    const { setId } = req.params;

    try {
        const filterData = { _id: setId, creator: userId };
        const findedSet = await Set.findOne(filterData);
        res.send(findedSet);
    } catch {
        res.status(400).send({ message: invalidDataErrorText })
    }
}

exports.deleteSet = async (req, res, next) => {
    const userId = req.userData.id;
    const { setId } = req.params;

    try {
        await Set.deleteOne({ _id: setId, creator: userId })
        res.send({})
    } catch {
        res.status(400).send({ message: invalidDataErrorText })
    }
}

exports.updateSet = async (req, res, next) => {
    const userId = req.userData.id;
    const newSet = {
        name: req.body.name,
        cards: req.body.cards,
        stats: req.body.stats,
        creator: userId
    };
    const { setId } = req.params;

    if (isAnyPropertyUndefinedAndSendErrorByResAndObject(res, newSet)) {
        return;
    }

    try {
        const updateData = await Set.updateOne({ _id: setId, creator: userId }, newSet);
        res.send({ ...newSet, _id: setId });
    }
    catch (error) {
        res.status(400).send({ message: invalidDataErrorText })
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

    if (isAnyPropertyUndefinedAndSendErrorByResAndObject(res, set)) {
        return;
    };

    try {
        const newSet = new Set(set);
        const addedSet = await newSet.save();
        res.status(201).send(addedSet);
    } catch (error) {
        const nameErrorMessage = error.errors.name.properties.message;
        if(nameErrorMessage) {
            if(isShortErrorAndSendErrorByResAndMessage(res, nameErrorMessage)) {
                return;
            }
        }
        res.status(400).send({ message: invalidDataErrorText })
    }
}