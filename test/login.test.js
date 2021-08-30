const app = require('../app');
const mongoose = require('mongoose');
const { responseStatusShouldBe, responseTypeShouldContainJson, responseBodyShouldContainProperty, messageShouldBe, makeHttpRequest, tryCreateValidUser, validUser } = require('./testApi');
beforeAll(async () => {
    await tryCreateValidUser();
})
afterAll(done => {
    mongoose.connection.close()
    done()
})

const loginRequest = (userData) => {
    return makeHttpRequest(app, {
        method: 'POST',
        endpoint: '/login',
        data: userData,
    });
}

describe('/login POST', () => {
    describe('when request is correct', () => {
        let response;
        beforeAll(async () => {
            response = await loginRequest(validUser);
        })

        it('type of response should contain json', () => {
            responseTypeShouldContainJson(response);
        })

        it('response status should be 200', () => {
            responseStatusShouldBe(response, 200);
        })

        it('response body should contain accessToken and accessTokenExpiresIn', () => {
            responseBodyShouldContainProperty(response, 'accessToken')
            responseBodyShouldContainProperty(response, 'accessTokenExpiresIn')
        })

        it('cookies should contain refreshToken', () => {
            const cookies = response.headers['set-cookie'][0].split('; ');
            const refreshTokenCookie = cookies[0];
            expect(refreshTokenCookie).toMatch('refreshToken');
        })
    })

    describe('when request is invalid', () => {
        describe('when username is undefined', () => {
            let response;
            beforeAll(async () => {
                const userData = {
                    ...validUser,
                    username: undefined
                }
                response = await loginRequest(userData)
            })

            it('type of response should contain json', () => {
                responseTypeShouldContainJson(response);
            })

            it('response status should be 400', () => {
                responseStatusShouldBe(response, 400);
            })

            it('message should be correct', () => {
                messageShouldBe(response, 'Username is required.')
            })
        })

        describe('when password is undefined', () => {
            let response;
            beforeAll(async () => {
                const userData = {
                    ...validUser,
                    password: undefined,
                }
                response = await loginRequest(userData)
            })

            it('type of response should contain json', () => {
                responseTypeShouldContainJson(response);
            })

            it('response status should be 400', () => {
                responseStatusShouldBe(response, 400);
            })

            it('message should be correct', () => {
                messageShouldBe(response, 'Password is required.')
            })
        })

        describe('when username is invalid', () => {
            let response;
            beforeAll(async () => {
                const userData = {
                    ...validUser,
                    username: 'us',
                }
                response = await loginRequest(userData)
            })

            it('type of response should contain json', () => {
                responseTypeShouldContainJson(response);
            })

            it('response status should be 400', () => {
                responseStatusShouldBe(response, 400);
            })

            it('message should be correct', () => {
                messageShouldBe(response, 'User does not exist.')
            })
        })

        describe('when password is invalid', () => {
            let response;

            beforeAll(async () => {
                const userData = {
                    ...validUser,
                    password: 'pas',
                }

                response = await loginRequest(userData)
            })

            it('type of response should contain json', () => {
                responseTypeShouldContainJson(response);
            })

            it('response status should be 400', () => {
                responseStatusShouldBe(response, 400);
            })

            it('message should be correct', () => {
                messageShouldBe(response, 'User does not exist.')
            })
        })
    })
})