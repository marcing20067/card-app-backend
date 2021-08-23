const httpRequest = require('supertest');
const User = require('../models/user.js');

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
    expect(response.body.hasOwnProperty(property));
}

const makeHttpRequest = async (app, options) => {
    const { method, endpoint, customCookie, isIncludeToken, data, customToken } = options;
    const lowercaseMethod = options.method.toLowerCase();

    let request = httpRequest(app)[lowercaseMethod](endpoint);

    if (method === 'POST' || method === 'PUT') {
        request = request.send(data);
    }

    if (customCookie) {
        request = request.set('Cookie', customCookie)
    }

    if (isIncludeToken) {
        const authToken = customToken || await getToken(app);
        request = request.set('Authorization', 'Bearer ' + authToken);
    }

    return request;
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

const createValidUser = async () => {
    const findedUser = await User.findOne(validUser);
    if(!findedUser) {
        const user = new User(validUser);
        const createdUser = await user.save();
        return createdUser;
    }
    return findedUser;
}

module.exports = {
    newUser,
    validUser,
    validSet,
    responseStatusShouldBe,
    responseTypeShouldContainJson,
    responseBodyShouldContainProperty,
    makeHttpRequest,
    getToken,
    createValidUser
}