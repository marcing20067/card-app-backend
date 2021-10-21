const httpRequest = require('supertest');
const User = require('../models/user');
const OneTimeToken = require('../models/oneTimeToken');

const jsonwebtoken = require('jsonwebtoken');
jest.mock('jsonwebtoken');

const validUser = {
    username: 'admin',
    password: 'password',
    email: 'email@mail.pl'
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

const responseStatusShouldBe = (response, status) => {
    expect(response.status).toBe(status);
}

const responseTypeShouldContainJson = (response) => {
    const contentType = response.headers['content-type'];
    expect(/json/.test(contentType))
}

const responseBodyShouldContainProperty = (response, property) => {
    expect(response.body).toHaveProperty(property);
}

const messageShouldBe = (response, correctMessage) => {
    const message = response.body.message;
    expect(message).toBe(correctMessage);
}

const request = (app, options, lowercaseMethod) => {
    const { method, endpoint, customCookie, data, customToken } = options;
    let request = httpRequest(app)[lowercaseMethod](endpoint);

    if (method === 'POST' || method === 'PUT') {
        request = request.send(data);
    }

    if (customCookie) {
        request = request.set('Cookie', customCookie)
    }
    request = request.set('Authorization', 'Bearer ' + 'Randomtoken');

    return request;
}

const makeHttpRequest = async (app, options) => {
    const { method, endpoint, customCookie, isIncludeToken, data, customToken } = options;
    const lowercaseMethod = options.method.toLowerCase();
    if (isIncludeToken) {
        const findedUser = await User.findOne({ username: validUser.username })
        jsonwebtoken.verify.mockReturnValue(findedUser);
    }
    const response = await request(app, options, lowercaseMethod);
    if (isIncludeToken) {
        jsonwebtoken.verify.mockRestore();
    }
    return response;
}

let token;

const getToken = async (app) => {
    if (!token) {
        const response = await makeHttpRequest(app, {
            method: 'POST',
            endpoint: '/login',
            data: validUser
        });
        token = response.body.accessToken
    }
    return token;
}

const findOrCreateValidUser = async () => {
    const findedUser = await findUser(validUser);
    if (findedUser) {
        return findedUser;
    }
    const createdUser = await createUser({ ...validUser, isActivated: true });
    return createdUser;
}

const findUser = async (filterData) => {
    const findedUser = await User.findOne(filterData);
    return findedUser;
}

const createUser = async () => {
    const user = new User({ ...validUser, isActivated: true });
    await user.save();
}

const createOneTimeToken = async (customTokenData) => {
    const randomToken = 'dasud92ddsay9dsa12IYDsuadi' + Math.floor(Math.random() * 500);
    const oneTimeTokenData = {
        resetPassword: {
            token: randomToken,
            endOfValidity: generateEndOfValidity()
        },
        resetUsername: {
            token: randomToken,
            endOfValidity: generateEndOfValidity()
        },
        activation: {
            token: randomToken,
            endOfValidity: generateEndOfValidity()
        },
        creator: '',
        ...customTokenData
    }

    const newOneTimeToken = new OneTimeToken({ ...oneTimeTokenData });
    const createdOneTimeToken = await newOneTimeToken.save();
    return createdOneTimeToken;
}

const generateEndOfValidity = () => {
    const oneTimeTokenExpiresInWeeks = 1;
    const now = new Date();
    const endOfValidity = new Date().setDate(now.getDate() + oneTimeTokenExpiresInWeeks * 7);
    return endOfValidity;
}

const getRandomUserData = () => {
    const letters = 'qwertyuiopasdfghjklzxcvbnm';
    const usernameLength = 8;
    let username = '';
    for (let i = 0; i < usernameLength; i++) {
        const randomIndex = Math.floor(Math.random() * letters.length);
        username = username + letters[randomIndex];
    }
    return {
        ...validUser,
        username: username,
        email: 'changePassword@example.com',
        isActivated: true
    }
}

module.exports = {
    newUser,
    validUser,
    validSet,
    responseStatusShouldBe,
    responseTypeShouldContainJson,
    responseBodyShouldContainProperty,
    messageShouldBe,
    makeHttpRequest,
    getToken,
    findOrCreateValidUser,
    createOneTimeToken,
    getRandomUserData
}