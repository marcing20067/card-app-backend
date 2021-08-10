const Set = require('../models/set.js');

const sendInvalidReqDataError = (res) => {
    res.status(400).send({ message: 'Invalid request data' })
}

exports.getSets = (req, res, next) => {
    const userId = req.userData.id;

    Set.find({ creator: userId })
        .then(sets => {
            if (!sets) throw new Error;
            res.send(sets)
        })
        .catch(() => sendInvalidReqDataError(res))
}

exports.getSet = (req, res, next) => {
    const userId = req.userData.id;
    const { setId } = req.params;

    Set.findOne({ _id: setId, creator: userId })
        .then(set => {
            if (!set) throw new Error;
            res.send(set)
        })
        .catch(() => sendInvalidReqDataError(res))
}

exports.deleteSet = (req, res, next) => {
    const userId = req.userData.id;
    const { setId } = req.params;

    Set.deleteOne({ _id: setId, creator: userId })
        .then(resData => {
            res.send({})
        })
        .catch(() => sendInvalidReqDataError(res))
}

exports.updateSet = (req, res, next) => {
    const newSet = req.body;
    const userId = req.userData.id;
    const { setId } = req.params;

    Set.updateOne({ _id: setId, creator: userId }, newSet)
        .then(updatedSet => { })
        .catch(() => sendInvalidReqDataError(res))
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
        .catch(() => sendInvalidReqDataError(res))
}