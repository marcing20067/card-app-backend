const app = require('../app');
const mongoose = require('mongoose');
const { responseStatusShouldBe, responseTypeShouldContainJson, responseBodyShouldContainProperty, messageShouldBe, makeHttpRequest, findOrCreateValidUser, validUser } = require('./testApi');
beforeAll(async () => {
    const user = await findOrCreateValidUser();
})

const bcryptjs = require('bcryptjs');
jest.mock('bcryptjs');

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
            bcryptjs.compare.mockResolvedValue(true);
            response = await loginRequest(validUser);
            bcryptjs.compare.mockRestore();
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
                messageShouldBe(response, 'User does not exist.')
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
                messageShouldBe(response, 'User does not exist.')
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

        describe('when valid password is failed', () => {
            let response;
            
            beforeAll(async () => {
                const userData = {
                    ...validUser,
                    password: 'password',
                }
                
                bcryptjs.compare.mockResolvedValue(false);
                response = await loginRequest(userData);
                bcryptjs.compare.mockRestore();
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