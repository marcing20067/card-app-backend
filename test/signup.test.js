const { makeHttpRequest, responseStatusShouldBe, responseTypeShouldContainJson, newUser, findOrCreateValidUser, messageShouldBe } = require('./testApi');
const app = require('../app');
const mongoose = require('mongoose');
const User = require('../models/user');
const OneTimeToken = require('../models/OneTimeToken');
beforeAll(async () => {
    await findOrCreateValidUser();
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
                endpoint: '/signup'
            })
    }

    beforeAll(async () => {
        const findedUser = await User.findOne({ username: newUser.username })
        if(findedUser) {
            await User.deleteOne({ username: newUser.username });
            await OneTimeToken.deleteOne({ creator: findedUser._id });
        }
    })

    describe('when request is correct', () => {
        let response;
        beforeAll(async () => {
            response = await signupRequest(newUser);
        })

        it('type of response should contain json', () => {
            responseTypeShouldContainJson(response);
        })

        it('response status should be 201', () => {
            responseStatusShouldBe(response, 201);
        })

        it('message should be correct', () => {
            messageShouldBe(response, 'Check your email.')
        })

        it('created user should exists in db', async () => {
            const findedUser = await User.findOne(newUser);
            expect(findedUser).not.toBe(null);
        })

        it('oneTimeToken should exists in db', async () => {
            const user = await User.findOne(newUser);
            const userId = user._id;
            const findedOneTimeToken = await OneTimeToken.findOne({ creator: userId });
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
                responseTypeShouldContainJson(response);
            })

            it('response status should be 400', () => {
                responseStatusShouldBe(response, 400);
            })

            it('message should be correct', () => {
                messageShouldBe(response, 'Username is too short.')
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
                responseTypeShouldContainJson(response);
            })

            it('response status should be 400', () => {
                responseStatusShouldBe(response, 400);
            })

            it('message should be correct', () => {
                messageShouldBe(response, 'Password is too short.')
            })
        })

        describe('when userData is empty object', () => {
            let response;
            beforeAll(async () => {
                const userData = {};
                response = await signupRequest(userData);
            });

            it('type of response should contain json', () => {
                responseTypeShouldContainJson(response);
            })

            it('response status should be 400', () => {
                responseStatusShouldBe(response, 400);
            })

            it('message should be correct', () => {
                messageShouldBe(response, 'Username is required.')
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
                responseTypeShouldContainJson(response);
            })

            it('response status should be 400', () => {
                responseStatusShouldBe(response, 400);
            })

            it('message should be correct', () => {
                messageShouldBe(response, 'Password is required.')
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
                responseTypeShouldContainJson(response);
            })

            it('response status should be 400', () => {
                responseStatusShouldBe(response, 400);
            })

            it('message should be correct', () => {
                messageShouldBe(response, 'Username is required.')
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
                responseTypeShouldContainJson(response);
            })

            it('response status should be 400', () => {
                responseStatusShouldBe(response, 400);
            })

            it('message should be correct', () => {
                messageShouldBe(response, 'Email is required.')
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
                responseTypeShouldContainJson(response);
            })

            it('response status should be 400', () => {
                responseStatusShouldBe(response, 400);
            })

            it('message should be correct', () => {
                messageShouldBe(response, 'Invalid request data.')
            })
        })

        describe('when username is already taken', () => {
            let response;
            beforeAll(async () => {
                if (!(await isUserExists({ ...newUser, username: 'taken', isActivated: true }))) {
                    await createUser({ ...newUser, username: 'taken', isActivated: true })
                }
            })
            beforeAll(async () => {
                response = await signupRequest({ ...newUser, username: 'taken'});
            })

            const isUserExists = async (userData) => {
                const findedUser = await User.findOne(userData);
                return !!findedUser;
            }

            const createUser = async (userData) => {
                const user = new User(userData);
                await user.save();
            }

            it('type of response should contain json', () => {
                responseTypeShouldContainJson(response);
            })

            it('response status should be 409', () => {
                responseStatusShouldBe(response, 409);
            })

            it('message should be correct', () => {
                messageShouldBe(response, 'Username is already taken.')
            })
        })
    })
})