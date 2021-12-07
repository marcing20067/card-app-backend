const app = require('../../app');
const mongoose = require('mongoose');
const { makeHttpRequest, createValidUser, newUser } = require('../testApi');
const User = require('../../models/user');
const OneTimeToken = require('../../models/oneTimeToken');

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

describe('/signup POST', () => {
    const signupRequest = (userData) => {
        return makeHttpRequest(app,
            {
                method: 'POST',
                data: userData,
                endpoint: '/auth/signup'
            })
    }

    describe('when request is correct', () => {
        let response;
        beforeAll(async () => {
            response = await signupRequest(newUser);
        })

        afterAll(async () => {
            const findedUser = await User.findOne({ username: newUser.username });
            await User.deleteOne({ _id: findedUser._id });
            await OneTimeToken.deleteOne({ creator: findedUser._id });
        })

        it('type of response should contain json', () => {
            const contentType = response.headers['content-type'];
            expect(/json/.test(contentType))
        })

        it('response status should be 201', () => {
            expect(response.status).toBe(201);
        })

        it('message should be correct', () => {
            const message = response.body.message;
            expect(message).toBe('Check your email.');
        })

        it('created user should exists in db', async () => {
            const findedUser = await User.findOne({ username: newUser.username });
            expect(findedUser).not.toBe(null);
        })

        it('oneTimeToken should exists in db', async () => {
            const user = await User.findOne({ username: newUser.username });
            const findedOneTimeToken = await OneTimeToken.findOne({ creator: user._id });
            expect(findedOneTimeToken).not.toBe(null);
        })
    })

    describe('when request is invalid', () => {
        describe('when username is too short', () => {
            let response;
            beforeAll(async () => {
                const userData = {
                    ...newUser,
                    username: 'u',
                }
                response = await signupRequest(userData);
            });

            it('type of response should contain json', () => {
                const contentType = response.headers['content-type'];
                expect(/json/.test(contentType))
            })

            it('response status should be 400', () => {
                expect(response.status).toBe(400);
            })

            it('message should be correct', () => {
                const message = response.body.message;
                expect(message).toBe('Username is too short.');
            })
        })

        describe('when password is too short', () => {
            let response;
            beforeAll(async () => {
                const userData = {
                    ...newUser,
                    password: 'p'
                }
                response = await signupRequest(userData);
            });

            it('type of response should contain json', () => {
                const contentType = response.headers['content-type'];
                expect(/json/.test(contentType))
            })

            it('response status should be 400', () => {
                expect(response.status).toBe(400);

            })

            it('message should be correct', () => {
                const message = response.body.message;
                expect(message).toBe('Password is too short.');
            })
        })

        describe('when userData is empty object', () => {
            let response;
            beforeAll(async () => {
                const userData = {};
                response = await signupRequest(userData);
            });

            it('type of response should contain json', () => {
                const contentType = response.headers['content-type'];
                expect(/json/.test(contentType))
            })

            it('response status should be 400', () => {
                expect(response.status).toBe(400);
            })

            it('message should be correct', () => {
                const message = response.body.message;
                expect(message).toBe('Username is required.');
            })
        })

        describe('when only password is undefined', () => {
            let response;
            beforeAll(async () => {
                const userData = {
                    ...newUser,
                    password: undefined,
                };
                response = await signupRequest(userData);
            });

            it('type of response should contain json', () => {
                const contentType = response.headers['content-type'];
                expect(/json/.test(contentType))
            })

            it('response status should be 400', () => {
                expect(response.status).toBe(400);
            })

            it('message should be correct', () => {
                const message = response.body.message;
                expect(message).toBe('Password is required.');
            })
        })

        describe('when only username is undefined', () => {
            let response;
            beforeAll(async () => {
                const userData = {
                    ...newUser,
                    username: undefined,
                };
                response = await signupRequest(userData);
            });

            it('type of response should contain json', () => {
                const contentType = response.headers['content-type'];
                expect(/json/.test(contentType))
            })

            it('response status should be 400', () => {
                expect(response.status).toBe(400);

            })

            it('message should be correct', () => {
                const message = response.body.message;
                expect(message).toBe('Username is required.');
            })
        })

        describe('when only email is undefined', () => {
            let response;
            beforeAll(async () => {
                const userData = {
                    username: newUser.username,
                    password: newUser.password
                };
                response = await signupRequest(userData);
            });

            it('type of response should contain json', () => {
                const contentType = response.headers['content-type'];
                expect(/json/.test(contentType))
            })

            it('response status should be 400', () => {
                expect(response.status).toBe(400);

            })

            it('message should be correct', () => {
                const message = response.body.message;
                expect(message).toBe('Email is required.');
            })
        })

        describe('when email is invalid', () => {
            let response;
            beforeAll(async () => {
                const userData = {
                    ...newUser,
                    email: 'email'
                };
                response = await signupRequest(userData);
            });

            it('type of response should contain json', () => {
                const contentType = response.headers['content-type'];
                expect(/json/.test(contentType))
            })

            it('response status should be 400', () => {
                expect(response.status).toBe(400);
            })

            it('message should be correct', () => {
                const message = response.body.message;
                expect(message).toBe('Invalid request data.');
            })
        })

        describe('when username is already taken', () => {
            let user;
            beforeAll(async () => {
                user = await createValidUser();
            })

            let response;
            beforeAll(async () => {
                response = await signupRequest({ ...user._doc, email: `custom${user._doc.email}` });
            })

            afterAll(async () => {
                await User.deleteMany({ password: user._doc.password })
            })

            it('type of response should contain json', () => {
                const contentType = response.headers['content-type'];
                expect(/json/.test(contentType))
            })

            it('response status should be 409', () => {
                expect(response.status).toBe(409);
            })

            it('message should be correct', () => {
                const message = response.body.message;
                expect(message).toBe('Username is already taken.');
            })
        })

        describe('when email is already taken', () => {
            let user;
            beforeAll(async () => {
                user = await createValidUser();
            })

            let response;
            beforeAll(async () => {
                response = await signupRequest({ ...user._doc, username: 'dummyusername1' });
            })

            afterAll(async () => {
                await User.deleteMany({ password: user.password });
            })

            it('type of response should contain json', () => {
                const contentType = response.headers['content-type'];
                expect(/json/.test(contentType))
            })

            it('response status should be 409', () => {
                expect(response.status).toBe(409);
            })

            it('message should be correct', () => {
                const message = response.body.message;
                expect(message).toBe('Email is already taken.');
            })
        })
    })
})