const app = require('../app.js');
const mongoose = require('mongoose');
const { responseStatusShouldBe, responseTypeShouldContainJson, responseBodyShouldContainProperty, makeHttpRequest, createValidUser, validUser } = require('./testApi.js');
beforeAll(async () => {
    await createValidUser();
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
    describe('correct request', () => {
        let response;
        beforeAll(async () => {
            response = await loginRequest({
                email: validUser.email,
                username: validUser.username,
                password: validUser.password
            })
        })

        it('basic correct request tests', () => {
            responseTypeShouldContainJson(response);
            responseStatusShouldBe(response, 200);
        })
        
        it('response body should contain tokenData', () => {
            responseBodyShouldContainProperty(response, 'accessToken')
            responseBodyShouldContainProperty(response, 'accessTokenExpiresIn')
        })

        it('should add refresh token cookie', () => {
            const cookies = response.headers['set-cookie'][0].split('; ');

            expect(cookies[0].includes('refreshToken'));
        })
    })

    describe('invalid request', () => {
        describe('request with empty username', () => {
            let response;
            const userData = {
                email: validUser.email,
                password: validUser.password
            }

            beforeAll(async () => {
                response = await loginRequest(userData)
            })
            it('basic wrong request tests', () => {
                responseTypeShouldContainJson(response);
                responseStatusShouldBe(response, 400);
                responseBodyShouldContainProperty(response, 'message');
            })

            it('message should be correct', () => {
                const message = response.body.message;
                expect(message).toEqual('Username is required.');
            })
        })

        describe('request without password', () => {
            let response;
            const userData = {
                email: validUser.email,
                username: validUser.username
            }
            beforeAll(async () => {
                response = await loginRequest(userData)
            })

            it('basic wrong request tests', () => {
                responseTypeShouldContainJson(response);
                responseStatusShouldBe(response, 400);
                responseBodyShouldContainProperty(response, 'message');
            })

            it('message should be correct"', () => {
                const message = response.body.message;
                expect(message).toEqual('Password is required.');
            })
        })

        describe('request with invalid username', () => {
            let response;
            const userData = {
                email: validUser.email,
                username: '',
                password: 'password'
            }

            beforeAll(async () => {
                response = await loginRequest(userData)
            })

            it('basic wrong request tests', () => {
                responseTypeShouldContainJson(response);
                responseStatusShouldBe(response, 400);
                responseBodyShouldContainProperty(response, 'message');
            })

            it('message should be correct', () => {
                const message = response.body.message;
                expect(message).toEqual('User does not exist.')
            })
        })

        describe('request with invalid password', () => {
            let response;
            const userData = {
                username: validUser.username,
                password: '',
                email: validUser.email
            }

            beforeAll(async () => {
                response = await loginRequest(userData)
            })

            it('basic wrong request tests', () => {
                responseTypeShouldContainJson(response);
                responseStatusShouldBe(response, 400);
                responseBodyShouldContainProperty(response, 'message');
            })

            it('message should be correct', () => {
                const message = response.body.message;
                expect(message).toEqual('User does not exist.')
            })
        })
    })
})