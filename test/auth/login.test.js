const app = require('../../app');
const mongoose = require('mongoose');
const { makeHttpRequest, createValidUser, validUser } = require('../testApi');
const User = require('../../models/user');
const bcryptjs = require('bcryptjs');
jest.mock('bcryptjs');

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

describe('/auth/login POST', () => {
    const loginRequest = (userData) => {
        return makeHttpRequest(app, {
            method: 'POST',
            endpoint: '/auth/login',
            isIncludeToken: true,
            data: userData,
        });
    }

    describe('when request is correct', () => {
        let response;
        beforeAll(async () => {
            bcryptjs.compare.mockResolvedValue(true);
            response = await loginRequest(user._doc);
            bcryptjs.compare.mockRestore();
        })

        it('type of response should contain json', () => {
            const contentType = response.headers['content-type'];
            expect(/json/.test(contentType))
        })

        it('response status should be 200', () => {
            expect(response.status).toBe(200);
        })

        it('response body should contain token data', () => {
            const data = response.body;
            expect(data).toHaveProperty('accessToken');
            expect(data).toHaveProperty('accessTokenExpiresIn');
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
                const contentType = response.headers['content-type'];
                expect(/json/.test(contentType))
            })

            it('response status should be 400', () => {
                expect(response.status).toBe(400);
            })

            it('message should be correct', () => {
                const message = response.body.message;
                expect(message).toBe('User does not exist.');
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
                const contentType = response.headers['content-type'];
                expect(/json/.test(contentType))
            })

            it('response status should be 400', () => {
                expect(response.status).toBe(400);
            })

            it('message should be correct', () => {
                const message = response.body.message;
                expect(message).toBe('User does not exist.');
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
                const contentType = response.headers['content-type'];
                expect(/json/.test(contentType))
            })

            it('response status should be 400', () => {
                expect(response.status).toBe(400);
            })

            it('message should be correct', () => {
                const message = response.body.message;
                expect(message).toBe('User does not exist.');
            })
        })

        describe('when valid password is failed', () => {
            let response;
            beforeAll(async () => {
                bcryptjs.compare.mockResolvedValue(false);
                response = await loginRequest(user._doc);
                bcryptjs.compare.mockRestore();
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
                expect(message).toBe('User does not exist.');
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
                const contentType = response.headers['content-type'];
                expect(/json/.test(contentType))
            })

            it('response status should be 400', () => {
                expect(response.status).toBe(400);
            })

            it('message should be correct', () => {
                const message = response.body.message;
                expect(message).toBe('User does not exist.');
            })
        })
    })
})