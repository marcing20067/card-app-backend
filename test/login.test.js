const app = require('../app');
const mongoose = require('mongoose');
const { makeHttpRequest, createValidUser,  validUser } = require('./testApi');

const bcryptjs = require('bcryptjs');
jest.mock('bcryptjs');
const User = require('../models/user');

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

        it('response body should contain accessToken and accessTokenExpiresIn', () => {
            expect(response.body).toHaveProperty('accessToken');
            expect(response.body).toHaveProperty('accessTokenExpiresIn');
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
                const userData = {
                    ...validUser,
                    password: 'password',
                }

                bcryptjs.compare.mockResolvedValue(false);
                response = await loginRequest(userData);
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