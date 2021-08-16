const Set = require('../models/set.js');
const setsErrorMessages = require('../errorTexts/controllersTexts/sets.js');

exports.getSets = (req, res, next) => {
    const userId = req.userData.id;

    Set.find({ creator: userId })
        .then(sets => {
            res.send(sets)
        })
        .catch(() => {
            res.status(400).send({ message: setsErrorMessages.invalidData })
        })
}

exports.getSet = (req, res, next) => {
    const userId = req.userData.id;
    const { setId } = req.params;

    Set.findOne({ _id: setId, creator: userId })
        .then(set => {
            if (!set) return res.status(400).send({ message: setsErrorMessages.invalidData });
            res.send(set)
        })
        .catch((err) => {
            res.status(400).send({ message: setsErrorMessages.invalidData })
        })
}

exports.deleteSet = (req, res, next) => {
    const userId = req.userData.id;
    const { setId } = req.params;

    Set.deleteOne({ _id: setId, creator: userId })
        .then(resData => {
            res.send({})
        })
        .catch(() => {
            res.status(400).send({ message: setsErrorMessages.invalidData })
        })
}

exports.updateSet = (req, res, next) => {
    const newSet = req.body;
    const userId = req.userData.id;
    const { setId } = req.params;

    Set.updateOne({ _id: setId, creator: userId }, newSet)
        .then(updatedSet => { })
        .catch(() => {
            res.status(400).send({ message: setsErrorMessages.invalidData })
        })
}

exports.addSet = (req, res, next) => {
    const set = req.body;
    const userId = req.userData.id;

    const newSet = new Set({
        ...set,
        creator: userId,
    });
    newSet.save()
        .then((addedSet) => {
            res.status(201).send(addedSet);
        })
        .catch(() => {
            res.status(400).send({ message: setsErrorMessages.invalidData })
        })
}