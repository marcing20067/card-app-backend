const User =  require('../models/user.js');

exports.signup = (req, res, next) => {
    const user = req.body;
    const newUser = new User(user);

    newUser.save()
        .then(createdUser => {
            res.status(201).send(createdUser);
        })
        .catch(err => {
            if (err.name === 'MongoError' && err.code === 11000) {
                return res.status(409).send({ message: 'Username is already taken' })
            }
            res.status(400).send('User data is invalid')
        })
}