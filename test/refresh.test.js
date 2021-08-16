const { httpPostByAppWithOptions, validUserData, httpGetByAppWithOptions } = require('./testApi.js');
const app = require('../app.js');
const mongoose = require('mongoose');

afterAll(done => {
    mongoose.connection.close()
    done()
})

const refreshRequest = (cookie) => {
    return httpGetByAppWithOptions(app, {
        endpoint: '/refresh',
        cookie
    });
}

describe('/refresh POST', () => {
    describe('correct request', () => {
        let response;
        beforeAll(async () => {
            const refreshTokenCookie = await loginRequestAndReturnRefreshTokenCookie();
            response = await refreshRequest(refreshTokenCookie);
        })

        const loginRequestAndReturnRefreshTokenCookie = async () => {
            const response = await httpPostByAppWithOptions(app, {
                endpoint: '/login',
                data: validUserData
            })
            const refreshTokenCookie = response.header['set-cookie'][0].split(';')[0]
            return refreshTokenCookie;
        }

        it('status should be 201', () => {
            expect(response.status).toEqual(201)
        })

        it('response type should contain json', () => {
            expect(/json/.test(response.headers['content-type']))
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

            it('response status should be 400', () => {
                expect(response.status).toEqual(400);
            })

            it('response type should contain json', () => {
                expect(/json/.test(response.headers['content-type']))
            })

            it('response body should contain message', () => {
                expect(response.body.message.hasOwnProperty('message'))
            })
            it('message should be correct', () => {
                const message = response.body.message;
                expect(message).toEqual('Invalid refresh token.');
            })
        })
    })
})
