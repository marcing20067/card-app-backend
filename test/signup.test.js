const { makeHttpRequest, responseStatusShouldBe, responseTypeShouldContainJson, newUser, createValidUser, messageShouldBe } = require('./testApi.js');
const app = require('../app.js');
const mongoose = require('mongoose');
const User = require('../models/user');
beforeAll(async () => {
    await createValidUser();
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
        await ifUserExistsDeleteIt();
    })

    const ifUserExistsDeleteIt = async () => {
        const user = await findUser({ username: newUser.username });
        if (user) {
            const userId = user._id;
            await deleteUser(userId);
        }
    }

    const findUser = async (userData) => {
        const findedUser = await User.findOne(userData);
        return findedUser;
    }

    const deleteUser = async (userId) => {
        await User.deleteOne({ _id: userId });
    }

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

        it('response body should be correct', () => {
            messageShouldBe(response, 'Check your email.')
        })

        it('user should exist in db', async () => {
            const findedUser = await findUser(newUser);
            expect(findedUser).not.toBe(null);
        })
    })

    describe('when request is invalid', () => {
        describe('when username is too short', () => {
            let response;
            beforeAll(async () => {
                const userData = {
                    ...newUser,
                    username: 's',
                }
                response = await signupRequest(userData);
            });

            it('type of response should contain json', () => {
                responseTypeShouldContainJson(response);
            })
    
            it('response status should be 400', () => {
                responseStatusShouldBe(response, 400);
            })
    
            it('response body should be correct', () => {
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
    
            it('response body should be correct', () => {
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
    
            it('response body should be correct', () => {
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
    
            it('response body should be correct', () => {
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
    
            it('response body should be correct', () => {
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
    
            it('response body should be correct', () => {
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
    
            it('response body should be correct', () => {
                messageShouldBe(response, 'Invalid request data.')
            })
        })

        describe('when username is already taken', () => {
            let response;

            beforeAll(async () => {
                await tryCreateUser();
                response = await signupRequest(newUser);
            })

            const tryCreateUser = async () => {
                try {
                    const user = new User({ ...newUser, isActivated: false });
                    await user.save();
                } catch {
                    // User already exists
                }
            }

            it('type of response should contain json', () => {
                responseTypeShouldContainJson(response);
            })
    
            it('response status should be 409', () => {
                responseStatusShouldBe(response, 409);
            })
    
            it('response body should be correct', () => {
                messageShouldBe(response, 'Username is already taken.')
            })
        })
    })
})