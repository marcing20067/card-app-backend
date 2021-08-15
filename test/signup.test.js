const { httpPostByAppWithOptions } = require('./testApi.js');
const app = require('../app.js');
const mongoose = require('mongoose');
const User = require('../models/user');

afterAll(done => {
    mongoose.connection.close()
    done()
})

describe('/signup POST', () => {
    const signupRequest = (userData) => {
        return httpPostByAppWithOptions(app,
            {
                data: userData,
                endpoint: '/signup'
            })
    }

    const newUserData = {
        username: 'newUsername',
        password: 'newPassword'
    }

    beforeAll(async () => {
        await User.deleteOne(newUserData)
    })


    describe('correct request', () => {
        let response;

        beforeAll(async () => {
            response = await signupRequest(newUserData);
        })

        afterAll(async () => {
            const createdUser = response.body;
            await User.deleteOne({ _id: createdUser._id })
        })

        it('status should be 201', () => {
            expect(response.status).toEqual(201)
        })

        it('response type should contain json', () => {
            expect(/json/.test(response.headers['content-type']))
        })

        it('response body should contain created user', () => {
            const createdUser = response.body;
            expect(createdUser.hasOwnProperty('_id'))
            expect(createdUser.username).toEqual(newUserData.username);
            expect(createdUser.password).toEqual(newUserData.password);
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

            it('status should be 400', () => {
                expect(response.status).toEqual(400)
            })

            it('response type should contain json', () => {
                expect(/json/.test(response.headers['content-type']))
            })

            it('response body should contain message', () => {
                expect(response.body.hasOwnProperty('message'))
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

            it('status should be 400', () => {
                expect(response.status).toEqual(400)
            })

            it('response type should contain json', () => {
                expect(/json/.test(response.headers['content-type']))
            })

            it('response body should contain message', () => {
                expect(response.body.hasOwnProperty('message'))
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

            it('status should be 400', () => {
                expect(response.status).toEqual(400)
            })

            it('response type should contain json', () => {
                expect(/json/.test(response.headers['content-type']))
            })

            it('response body should contain message', () => {
                expect(response.body.hasOwnProperty('message'))
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

            it('status should be 400', () => {
                expect(response.status).toEqual(400)
            })

            it('response type should contain json', () => {
                expect(/json/.test(response.headers['content-type']))
            })

            it('response body should contain message', () => {
                expect(response.body.hasOwnProperty('message'))
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

            it('status should be 400', () => {
                expect(response.status).toEqual(400)
            })

            it('response type should contain json', () => {
                expect(/json/.test(response.headers['content-type']))
            })

            it('response body should contain message', () => {
                expect(response.body.hasOwnProperty('message'))
            })

            it('message should be correct', () => {
                expect(response.body.message).toEqual('Username is required.')
            })
        })

        describe('username is already taken', () => {
            let response;
            beforeAll(async () => {
                response = await signupRequest(newUserData);
            });

            beforeAll(async () => {
                response = await signupRequest(newUserData);
            })

            it('status should be 400', () => {
                expect(response.status).toEqual(409)
            })

            it('response type should contain json', () => {
                expect(/json/.test(response.headers['content-type']))
            })

            it('response body should contain message', () => {
                expect(response.body.hasOwnProperty('message'))
            })

            it('message should be correct', () => {
                expect(response.body.message).toEqual('Username is already taken.')
            })
        })
    })
})