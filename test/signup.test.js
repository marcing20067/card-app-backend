const { makeHttpRequest, responseStatusShouldBe, responseTypeShouldContainJson, responseBodyShouldContainProperty, newUser } = require('./testApi.js');
const app = require('../app.js');
const mongoose = require('mongoose');
const User = require('../models/user');

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
        const user = await findUser(newUser);
        const userId = user._id;
        await deleteUser(userId);
    })

    const findUser = async (userData) => {
        const findedUser = await User.findOne(userData);
        return findedUser._id;
    }

    const deleteUser = async (userId) => {
        await User.deleteOne({ _id: userId });
    }

    describe('correct request', () => {
        let response;

        beforeAll(async () => {
            response = await signupRequest(newUser);
        })

        afterAll(async () => {
            const createdUser = response.body;
            await deleteUser(createdUser._id)
        })

        it('basic correct request tests', () => {
            responseTypeShouldContainJson(response);
            responseStatusShouldBe(response, 201);
        })

        it('response body should contain user', () => {
            const createdUser = response.body;
            expect(createdUser.hasOwnProperty('_id'))
            expect(createdUser.username).toEqual(newUser.username);
            expect(createdUser.password).toEqual(newUser.password);
        })
    })

    describe('invalid request', () => {
        describe('username is too short', () => {
            let response;
            beforeAll(async () => {
                const userData = {
                    username: 's',
                    password: 'password'
                }
                response = await signupRequest(userData);
            });

            it('basic wrong request tests', () => {
                responseTypeShouldContainJson(response);
                responseStatusShouldBe(response, 400);
                responseBodyShouldContainProperty(response, 'message');
            })

            it('message should be correct"', () => {
                expect(response.body.message).toEqual("Username is too short.")
            })
        })

        describe('password is too short', () => {
            let response;
            beforeAll(async () => {
                const userData = {
                    username: 'username',
                    password: 'p'
                }
                response = await signupRequest(userData);
            });

            it('basic wrong request tests', () => {
                responseTypeShouldContainJson(response);
                responseStatusShouldBe(response, 400);
                responseBodyShouldContainProperty(response, 'message');
            })

            it('message should be correct', () => {
                expect(response.body.message).toEqual("Password is too short.")
            })
        })

        describe('user data is empty object', () => {
            let response;
            beforeAll(async () => {
                const userData = {};
                response = await signupRequest(userData);
            });

            it('basic wrong request tests', () => {
                responseTypeShouldContainJson(response);
                responseStatusShouldBe(response, 400);
                responseBodyShouldContainProperty(response, 'message');
            })

            it('message should be correct"', () => {
                expect(response.body.message).toEqual("Username is required.");
            })
        })


        describe('without password', () => {
            let response;
            beforeAll(async () => {
                const userData = {
                    username: 'username'
                };
                response = await signupRequest(userData);
            });

            it('basic wrong request tests', () => {
                responseTypeShouldContainJson(response);
                responseStatusShouldBe(response, 400);
                responseBodyShouldContainProperty(response, 'message');
            })

            it('message should be correct', () => {
                expect(response.body.message).toEqual('Password is required.')
            })
        })

        describe('without username', () => {
            let response;
            beforeAll(async () => {
                const userData = {
                    password: 'password'
                };
                response = await signupRequest(userData);
            });

            it('basic wrong request tests', () => {
                responseTypeShouldContainJson(response);
                responseStatusShouldBe(response, 400);
                responseBodyShouldContainProperty(response, 'message');
            })

            it('message should be correct', () => {
                expect(response.body.message).toEqual('Username is required.')
            })
        })

        describe('username is already taken', () => {
            let response;

            beforeAll(async () => {
                await createUser()
            })

            const createUser = async () => {
                const user = new User(newUser);
                const createdUser = await user.save();
                return createdUser;
            }

            beforeAll(async () => {
                response = await signupRequest(newUser);
            })

            it('basic wrong request tests', () => {
                responseTypeShouldContainJson(response);
                responseStatusShouldBe(response, 409);
                responseBodyShouldContainProperty(response, 'message');
            })

            it('message should be correct', () => {
                expect(response.body.message).toEqual('Username is already taken.')
            })
        })
    })
})