const { makeHttpRequest, createValidUser } = require('./testApi');
const app = require('../app');
const mongoose = require('mongoose');
const User = require('../models/user');

const jsonwebtoken = require('jsonwebtoken');
jest.mock('jsonwebtoken');

let user;
beforeAll(async () => {
    user = await createValidUser();
})

afterAll(async () => {
    await User.deleteOne({ _id: user._id });
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
            ...extraOptions
        });
    }

    describe('when request is correct', () => {
        let response;
        beforeAll(async () => {
            jsonwebtoken.verify.mockReturnValue(user);
            jsonwebtoken.sign.mockReturnValue('token')
            response = await refreshRequest();
            jest.restoreAllMocks()
        })

        it('type of response should contain json', () => {
            const contentType = response.headers['content-type'];
            expect(/json/.test(contentType))
        })

        it('response status should be 201', () => {
            expect(response.statusCode).toBe(201);
        })

        it('response body should contain access accessToken and accessTokenExpiresIn', () => {
            expect(response.body).toHaveProperty('accessToken')
            expect(response.body).toHaveProperty('accessTokenExpiresIn')
        })
    })

    describe('when request is invalid', () => {
        describe('when refresh token doesn\'t exist in cookies', () => {
            beforeAll(async () => {
                response = await refreshRequest({
                    isIncludeToken: true
                });
            })

            it('type of response should contain json', () => {
                const contentType = response.headers['content-type'];
                expect(/json/.test(contentType))
            })

            it('response status should be 400', () => {
                expect(response.status).toBe(400);
            })

            it('message should be correct', () => {
                const message = response.body.message;
                expect(message).toBe('Invalid refresh token.')
            })
        })
    })
})
