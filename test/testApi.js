const httpRequest = require('supertest');
const User = require('../models/user');
const Set = require('../models/set');
const jsonwebtoken = require('jsonwebtoken');
jest.mock('jsonwebtoken');
jsonwebtoken.sign.mockReturnValue('dsaojdasodsadas');

const createRandomString = () => {
    const alphabet = 'AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz'
    let randomString = '';
    for (let i = 0; i < 15; i++) {
        const randomIndex = Math.floor(Math.random() * alphabet.length);
        const randomLetter = alphabet[randomIndex];
        randomString = randomString + randomLetter;
    }
    return randomString;
}

const createValidUserData = () => {
    const randomString = createRandomString();

    return {
        username: randomString,
        password: 'password',
        email: `a${randomString}@mail.pl`,
        isActivated: true
    }
}

const validUser = {
    username: 'admin',
    password: 'password',
    email: 'email@mail.pl',
    isActivated: true
}

const newUser = {
    username: 'newUsername',
    password: 'newPassword',
    email: 'email1@mail.pl'
}

const validSet = {
    name: 'name',
    cards: [
        {
            concept: 'concept',
            definition: 'definition',
            group: 1
        }
    ],
    stats: {
        group1: 1,
        group2: 0,
        group3: 0,
        group4: 0,
        group5: 0
    },
    creator: 'creator'
}

const request = (app, options, lowercaseMethod) => {
    const { method, endpoint, customCookie, data } = options;
    let request = httpRequest(app)[lowercaseMethod](endpoint);

    if (method === 'POST' || method === 'PUT') {
        request = request.send(data);
    }

    if (customCookie) {
        request = request.set('Cookie', customCookie)
    }
    request = request.set('Authorization', 'Bearer ' + 'Randomtoken').set('Accept', 'application/json');

    return request;
}

const createValidSet = async (customData) => {
    const newSet = new Set({
        ...validSet,
        name: createRandomString(),
        ...customData
    });
    const createdSet = await newSet.save();
    return createdSet;
}

const makeHttpRequest = async (app, options) => {
    const { isIncludeToken, method, customJwtVerifyReturn } = options;
    const lowercaseMethod = method.toLowerCase();
    if (isIncludeToken) {
        const findedUser = await User.findOne({ username: validUser.username })
        jsonwebtoken.verify.mockReturnValue(customJwtVerifyReturn || findedUser);
    }
    const response = await request(app, options, lowercaseMethod);
    if (isIncludeToken) {
        jsonwebtoken.sign.mockRestore();
        jsonwebtoken.verify.mockRestore();
    }
    return response;
}

const createValidUser = async () => {
    const userData = createValidUserData();
    const newUser = new User(userData);
    const createdUser = await newUser.save();
    return createdUser;
}

module.exports = {
    newUser,
    validUser,
    validSet,
    makeHttpRequest,
    createValidUserData,
    createValidUser,
    createValidSet
}