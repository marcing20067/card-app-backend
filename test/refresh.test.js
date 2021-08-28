const { validUser, responseStatusShouldBe, responseTypeShouldContainJson, responseBodyShouldContainProperty, makeHttpRequest, messageShouldBe, tryCreateValidUser } = require('./testApi.js');
const app = require('../app.js');
const mongoose = require('mongoose');
beforeAll(async () => {
    await tryCreateValidUser();
})
afterAll(done => {
    mongoose.connection.close()
    done()
})


describe('/refresh GET', () => {
    const refreshRequest = (extraOptions) => {
        return makeHttpRequest(app, {
            method: 'GET',
            endpoint: '/refresh',
            isIncludeToken: true,
            ...extraOptions
        });
    }

    describe('when request is correct', () => {
        let response;
        beforeAll(async () => {
            const refreshTokenCookie = await getRefreshTokenCookie();
            response = await refreshRequest({
                customCookie: refreshTokenCookie
            });
        })

        const getRefreshTokenCookie = async () => {
            const cookieResponse = await loginRequest(validUser);
            const refreshTokenCookie = cookieResponse.header['set-cookie'][0].split(';')[0]
            return refreshTokenCookie;
        }

        const loginRequest = (userData) => {
            return makeHttpRequest(app, {
                method: 'POST',
                endpoint: '/login',
                data: userData
            })
        }

        it('type of response should contain json', () => {
            responseTypeShouldContainJson(response);
        })

        it('response status should be 201', () => {
            responseStatusShouldBe(response, 201);
        })

        it('response body should contain access accessToken and accessTokenExpiresIn', () => {
            responseBodyShouldContainProperty(response, 'accessToken')
            responseBodyShouldContainProperty(response, 'accessTokenExpiresIn')
        })
    })

    describe('when request is invalid', () => {
        describe('when access token is invalid', () => {
            beforeAll(async () => {
                response = await refreshRequest({
                    customToken: 'wrongToken'
                });
            })

            it('type of response should contain json', () => {
                responseTypeShouldContainJson(response);
            })

            it('response status should be 401', () => {
                responseStatusShouldBe(response, 401);
            })

            it('message should be correct', () => {
                messageShouldBe(response, 'Invalid authorization.')
            })
        })
        describe('when refresh token doesn\'t exist in cookies', () => {
            beforeAll(async () => {
                response = await refreshRequest({
                    customCookie: null
                });
            })

            it('type of response should contain json', () => {
                responseTypeShouldContainJson(response);
            })

            it('response status should be 401', () => {
                responseStatusShouldBe(response, 400);
            })

            it('message should be correct', () => {
                messageShouldBe(response, 'Invalid refresh token.')
            })
        })
    })
})
