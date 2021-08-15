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
        let refreshTokenCookie;
        beforeAll(async () => {
            const loginResponse = await httpPostByAppWithOptions(app, {
                endpoint: '/login',
                data: validUserData
            })
            refreshTokenCookie = loginResponse.header['set-cookie'][0].split(';')[0]
        })
        beforeAll(async () => {
            response = await refreshRequest(refreshTokenCookie);
        })

        it('status should be 201', () => {
            expect(response.status).toEqual(201)
        })

        it('response type should contain json', () => {
            expect(/json/.test(response.headers['content-type']))
        })

        it('response body should contain access token', () => {
            expect(response.body.hasOwnProperty('accessToken'));
        })

        it('response body should contain access token expires in', () => {
            expect(response.body.hasOwnProperty('accessTokenExpiresIn'))
        })
    })

    describe('invalid request', () => {
        describe('refresh token doesnt exist in cookie', () => {
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
                expect(response.body.message).toEqual('Invalid refresh token.');
            })
        })
    })
})
