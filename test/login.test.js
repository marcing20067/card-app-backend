const app = require('../app.js');
const mongoose = require('mongoose');
const { responseStatusShouldBe, responseTypeShouldContainJson, responseBodyShouldContainProperty, makeHttpRequest, createValidUser } = require('./testApi.js');
beforeAll(async () => {
    const user = await createValidUser(app);
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
                username: 'admin',
                password: 'password'
            })
        })

        it('basic correct request tests', () => {
            responseTypeShouldContainJson(response);
            responseStatusShouldBe(response, 200);
        })
        
        it('response body should contain tokenData', () => {
            responseBodyShouldContainProperty(response, 'refreshToken')
            responseBodyShouldContainProperty(response, 'refreshToken')
            responseBodyShouldContainProperty(response, 'refreshTokenExpiresIn')
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
                expect(message).toEqual('Username is required.');
            })
        })

        describe('request with empty password', () => {
            let response;
            const userData = {
                username: 'username'
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
                username: 'username',
                password: ''
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