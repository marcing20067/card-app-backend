const httpRequestByApp = require('supertest');

const validUserData = {
    username: 'admin',
    password: 'password',
}

const newUserData = {
    username: 'newUsername',
    password: 'newPassword'
}

const set = {
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

const makeHttpReqByAppWithOptions = async (app, options) => {
    const { method, endpoint, cookie, isIncludeToken, data, customToken } = options;
    // Key of object must be lowercase
    const methodKey = options.method.toLowerCase();
    
    let request = httpRequestByApp(app)[methodKey](endpoint);

    if(method === 'POST') {
        request = request.send(data);
    }

    if (cookie) {
        request = request.set('Cookie', cookie)
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
        const response = await makeHttpReqByAppWithOptions(app, {
            method: 'POST',
            endpoint: '/login',
            data: validUserData
        });
        token = response.body.accessToken
    }
    return token;
}

module.exports = {
    makeHttpReqByAppWithOptions,
    httpRequestByApp,
    validUserData,
    newUserData,
    set,
}