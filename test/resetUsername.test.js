const app = require('../app');
const mongoose = require('mongoose');
const { makeHttpRequest, createValidUser } = require('./testApi');
const OneTimeToken = require('../models/oneTimeToken');
const User = require('../models/user');

afterAll(done => {
    mongoose.connection.close();
    done();
})
describe('/resetUsername POST', () => {
    const resetUsernameRequest = (username, extraOptions) => {
        return makeHttpRequest(app, {
            method: 'POST',
            endpoint: `/resetUsername`,
            data: {
                username: username
            },
            ...extraOptions
        });
    }

    describe('when request is correct', () => {
        let user;
        beforeAll(async () => {
            user = await createValidUser();
        })

        let oneTimeToken;
        beforeAll(async () => {
            const newOneTimeToken = new OneTimeToken({
                creator: user._id
            });
            oneTimeToken = await newOneTimeToken.save();
        })

        afterAll(async () => {
            await User.findByIdAndDelete(user._id);
            await OneTimeToken.deleteOne({ creator: user._id })
        })

        let response;
        beforeAll(async () => {
            response = await resetUsernameRequest(user.username);
        })

        it('type of response should contain json', () => {
            const contentType = response.headers['content-type'];
            expect(/json/.test(contentType))
        })

        it('response status should be 200', () => {
            expect(response.status).toBe(200);
        })

        it('message should be correct', () => {
            const message = response.body.message;
            expect(message).toBe('Check your email.');
        })

        it('the one time token should be updated', async () => {
            const findedOneTimeToken = await OneTimeToken.findOne({ creator: user._id });
            expect(findedOneTimeToken).not.toEqual(oneTimeToken);
        })
    })


    describe('when request is wrong', () => {
        describe('when username is wrong', () => {
            let user;
            beforeAll(async () => {
                user = await createValidUser();
            })

            let oneTimeToken;
            beforeAll(async () => {
                const newOneTimeToken = new OneTimeToken({
                    creator: user._id
                });
                oneTimeToken = await newOneTimeToken.save();
            })



            let response;
            beforeAll(async () => {
                const wrongUsername = '';
                response = await resetUsernameRequest(wrongUsername);
            })

            afterAll(async () => {
                await User.findByIdAndDelete(user._id);
                await OneTimeToken.deleteOne({ creator: user._id })
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

describe('/resetUsername/:oneTimeToken POST', () => {
    const resetUsernameWithTokenRequest = (resetUsernameToken, extraOptions) => {
        return makeHttpRequest(app, {
            method: 'POST',
            endpoint: `/resetUsername/${resetUsernameToken}`,
            data: {},
            ...extraOptions
        });
    }

    describe('when request is correct', () => {
        let user;
        beforeAll(async () => {
            user = await createValidUser();
        })

        let oneTimeToken;
        beforeAll(async () => {
            const newOneTimeToken = new OneTimeToken({
                creator: user._id
            });
            oneTimeToken = await newOneTimeToken.save();
        })

        let response;
        beforeAll(async () => {
            response = await resetUsernameWithTokenRequest(oneTimeToken.resetUsername.token, {
                data: {
                    currentUsername: user.username,
                    newUsername: 'extraNewUsername123!'
                }
            });
        })

        afterAll(async () => {
            await User.findByIdAndDelete(user._id);
            await OneTimeToken.deleteOne({ creator: user._id })
        })

        it('type of response should contain json', () => {
            const contentType = response.headers['content-type'];
            expect(/json/.test(contentType))
        })

        it('response status should be 200', () => {
            expect(response.status).toBe(200);
        })

        it('message should be correct', () => {
            const message = response.body.message;
            expect(message).toBe('Username has been changed successfully.');
        })

        it('user username should be changed', async () => {
            const findedUser = await User.findOne({ _id: user._id });
            expect(findedUser.username).toBe('extraNewUsername123!');
        })
    })


    describe('when request is wrong', () => {
        let user;
        beforeAll(async () => {
            user = await createValidUser();
        })

        let oneTimeToken;
        beforeAll(async () => {
            const newOneTimeToken = new OneTimeToken({
                creator: user._id
            });
            oneTimeToken = await newOneTimeToken.save();
        })

        afterAll(async () => {
            await User.findByIdAndDelete(user._id);
            await OneTimeToken.deleteOne({ creator: user._id })
        })

        describe('when the username is the same as the previous one', () => {
            let response;
            beforeAll(async () => {
                response = await resetUsernameWithTokenRequest(oneTimeToken.resetUsername.token, {
                    data: {
                        currentUsername: user.username,
                        newUsername: user.username
                    }
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
                expect(message).toBe('The username is the same as the previous one.');
            })
        })

        describe('when resetUsernameToken is wrong', () => {
            let response;
            beforeAll(async () => {
                const wrongToken = 'wrongToken';
                response = await resetUsernameWithTokenRequest(wrongToken);
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
                expect(message).toBe('Invalid request data.');
            })
        })
    })
})