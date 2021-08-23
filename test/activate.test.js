const app = require('../app.js');
const mongoose = require('mongoose');
const { responseStatusShouldBe, responseTypeShouldContainJson, responseBodyShouldContainProperty, makeHttpRequest, getToken, createValidUser } = require('./testApi.js');

const base64url = require('base64url');
const OneTimeToken = {};
beforeAll(async () => {
    const user = await createValidUser();
})
afterAll(done => {
    mongoose.connection.close()
    done()
})

const activeRequest = (customToken = undefined) => {
    return makeHttpRequest(app, {
        method: 'GET',
        endpoint: '/activate',
        isIncludeToken: true,
        customToken: customToken
    });
}
const activateUserRequest = (oneTimeToken, customToken = undefined) => {
    return makeHttpRequest(app, {
        method: 'GET',
        endpoint: `/activate/${oneTimeToken}`,
        isIncludeToken: true,
        customToken: customToken
    });
}

describe('/active GET', () => {
    describe('correct request', () => {
        let response;
        beforeAll(async () => {
            response = activeRequest();
        })

        it('basic correct request tests', () => {
            responseStatusShouldBe(response, 200);
            responseTypeShouldContainJson(response);
        })

        it('message should be exist', () => {
            responseBodyShouldContainProperty(response, 'message');
        })

        it('message should be correct', () => {
            const message = response.body.message;
            expect(message).toEqual('Check your email.')
        })
    })

    describe('wrong request', () => {
        describe('request with wrong access token', () => {
            let response;
            beforeAll(async () => {
                const wrongToken = 'wrongToken';
                response = await activeRequest(wrongToken);
            })

            it('basic wrong request tests', () => {
                responseTypeShouldContainJson(response);
                responseStatusShouldBe(response, 400);
                responseBodyShouldContainProperty(response, 'message');
            })

            it('message should be correct', () => {
                const message = response.body.message;
                expect(message).toBe('Invalid authentication.')
            })
        })
    })
})

describe('/active/:token GET', () => {
    describe('correct request', () => {
        let response;

        beforeAll(async () => {
            const oneTimeToken = await getOneTimeToken();
            response = await activateUserRequest(oneTimeToken);
        })

        it('basic correct request tests', () => {
            responseTypeShouldContainJson(response);
            responseStatusShouldBe(response, 200);
        })

        it('message should be exist', () => {
            responseBodyShouldContainProperty(response, 'message');
        })

        it('message should be correct', () => {
            const message = response.body.message;
            expect(message).toBe('The user has been activated successfully.')
        })
    })

    describe('wrong request', () => {
        describe('request with wrong access token', () => {
            beforeAll(async () => {
                const wrongAccessToken = 'wrongToken';
                const wrongOneTimeToken = 'wrongToken'
                response = await activateUserRequest(wrongOneTimeToken, wrongAccessToken);
            })

            it('basic wrong request tests', () => {
                responseTypeShouldContainJson(response);
                responseStatusShouldBe(response, 400);
                responseBodyShouldContainProperty(response, 'message');
            })
        })

        describe('request with wrong oneTimeToken', () => {
            beforeAll(async () => {
                const wrongOneTimeToken = 'wrongToken';
                response = await activateUserRequest(wrongOneTimeToken);
            })

            it('basic wrong request tests', () => {
                responseTypeShouldContainJson(response);
                responseStatusShouldBe(response, 400);
                responseBodyShouldContainProperty(response, 'message');
            })
        })
    })

    const getOneTimeToken = async () => {
        const userId = await getUserId();
        const oneTimeToken = await OneTimeToken.findOne({
            creator: userId
        })
        return oneTimeToken.token;
    }

    const getUserId = async () => {
        const accessToken = await getToken(app);
        const encodedUserId = accessToken.split('.')[0];
        const decodedUserId = base64url.decode(encodedUserId);
        return decodedUserId;
    }
})
