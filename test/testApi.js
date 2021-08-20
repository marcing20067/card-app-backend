const httpRequest = require('supertest');

const validUser = {
    username: 'admin',
    password: 'password',
}

const newUser = {
    username: 'newUsername',
    password: 'newPassword'
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
    expect(response.status).toEqual(status);
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
        const authToken = customToken || await getTokenByApp(app);
        request = request.set('Authorization', 'Bearer ' + authToken);
    }

    return request;
}

let token;

const getTokenByApp = async (app) => {
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

module.exports = {
    newUser,
    validUser,
    validSet,
    responseStatusShouldBe,
    responseTypeShouldContainJson,
    responseBodyShouldContainProperty,
    makeHttpRequest,
}