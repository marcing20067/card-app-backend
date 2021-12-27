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
            method: 'POST',
            data: {},
            endpoint: '/refresh',
            ...extraOptions
        });
    }

    describe('when request is correct', () => {
        let response;
        beforeAll(async () => {
            jsonwebtoken.verify.mockReturnValue(user);
            jsonwebtoken.sign.mockReturnValue('token')
            response = await refreshRequest({
                customCookie: 'refreshToken=dummy'
            });
            jest.restoreAllMocks()
        })

        it('response status should be 201', () => {
            expect(response.statusCode).toBe(201);
        })

        it('response body should contain tokenData', () => {
            const data = response.body;
            expect(data).toHaveProperty('accessTokenExpiresIn');
            expect(data).toHaveProperty('accessToken');
        })
    })

    describe('when request is invalid', () => {
        describe('when refresh token doesn\'t exist', () => {
            beforeAll(async () => {
                response = await refreshRequest({
                    isIncludeToken: true
                });
            })

            it('response status should be 200', () => {
                expect(response.status).toBe(200);
            })

            it('response body should contain error', () => {
                const message = response.body.error;
                expect(message).toBe('Invalid refresh token.')
            })
        })
    })
})
