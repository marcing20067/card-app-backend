const { validUser, responseStatusShouldBe, responseTypeShouldContainJson, responseBodyShouldContainProperty, makeHttpRequest } = require('./testApi.js');
const app = require('../app.js');
const mongoose = require('mongoose');

afterAll(done => {
    mongoose.connection.close()
    done()
})

const refreshRequest = (customCookie) => {
    return makeHttpRequest(app, {
        method: 'GET',
        endpoint: '/refresh',
        customCookie: customCookie,
    });
}

describe('/refresh GET', () => {
    describe('correct request', () => {
        let response;
        beforeAll(async () => {
            const refreshTokenCookie = await getRefreshTokenCookie();
            response = await refreshRequest(refreshTokenCookie);
        })

        const loginRequest = (userData) => {
            return makeHttpRequest(app, {
                method: 'POST',
                endpoint: '/login',
                data: userData
            })
        }

        const getRefreshTokenCookie = async () => {
            const cookieResponse = await loginRequest(validUser);
            const refreshTokenCookie = cookieResponse.header['set-cookie'][0].split(';')[0]
            return refreshTokenCookie;
        }

        it('basic correct request tests', () => {
            responseTypeShouldContainJson(response);
            responseStatusShouldBe(response, 201);
        })

        it('response body should contain access token data', () => {
            expect(response.body.hasOwnProperty('accessToken'));
            expect(response.body.hasOwnProperty('accessTokenExpiresIn'))
        })
    })

    describe('invalid request', () => {
        describe('refresh token doesn\'t exist in cookie', () => {
            beforeAll(async () => {
                response = await refreshRequest();
            })

            it('basic wrong request tests', () => {
                responseTypeShouldContainJson(response);
                responseStatusShouldBe(response, 400);
                responseBodyShouldContainProperty(response, 'message');
            })

            it('message should be correct', () => {
                const message = response.body.message;
                expect(message).toEqual('Invalid refresh token.');
            })
        })
    })
})
