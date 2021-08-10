const supertest = require('supertest');

let token;

const validUserData = {
    username: 'admin',
    password: 'password',
}

const httpRequestByApp = (app) => {
    return supertest(app);
}

const httpGetByAppWithOptions = async (app, options) => {
    const { endpoint, isIncludeToken } = options;
    let request = httpRequestByApp(app)
        .get(endpoint);

    if (isIncludeToken) {
        const authToken = await getTokenByApp(app);
        request = request.set('Authorization', 'Bearer ' + authToken);
    }
    return request;
}

const httpPostByAppWithOptions = async (app, options) => {
    const { endpoint, isIncludeToken, data } = options;
    let request = httpRequestByApp(app)
        .post(endpoint)
        .send(data)

    if (isIncludeToken) {
        const token = await getTokenByApp(app);
        request = request.set('Authorization', 'Bearer ' + token)
    }
    return request;
}

const httpDeleteByAppWithOptions = (app, options) => {
    const { endpoint, isIncludeToken } = options;
    let request = httpRequestByApp(app)
        .delete(endpoint)

    if (isIncludeToken) {
        const token = getTokenByApp(app);
        request = request.set('Authorization', 'Bearer ' + token)
    }
    return request;
}


const getTokenByApp = async (app) => {
    if (!token) {
        const response = await httpPostByAppWithOptions(app, {
            endpoint: '/login',
            data: validUserData
        });
        token = response.body.accessToken
    }
    return token;
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
    creator: ''
}

module.exports = {
    httpRequestByApp,
    validUserData,
    httpGetByAppWithOptions,
    httpPostByAppWithOptions,
    httpDeleteByAppWithOptions,
    set
}