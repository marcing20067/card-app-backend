const app = require('../app');
const mongoose = require('mongoose');
const { responseStatusShouldBe, responseTypeShouldContainJson, makeHttpRequest, getRandomUserData, messageShouldBe, createOneTimeToken } = require('./testApi');
const OneTimeToken = require('../models/oneTimeToken');
const User = require('../models/user');

afterAll(done => {
    mongoose.connection.close()
    done();
})

const createUser = async (userData) => {
    const newUser = new User(userData);
    const createdUser = newUser.save();
    return createdUser;
}

const deleteOneTimeToken = async (filter) => {
    await OneTimeToken.deleteOne(filter);
}

const deleteUser = async (userData) => {
    await User.deleteOne(userData);
}

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
        let oneTimeToken;
        beforeAll(async () => {
            user = await createUser(getRandomUserData());
            oneTimeToken = createOneTimeToken({
                creator: user._id
            });
        })

        afterAll(async () => {
            await deleteUser({ _id: user._id });
            await deleteOneTimeToken({ creator: user._id })
        })

        let response;
        beforeAll(async () => {
            response = await resetUsernameRequest(user.username);
        })

        const getOneTimeToken = async (filter) => {
            const findedOneTimeToken = await OneTimeToken.findOne(filter);
            return findedOneTimeToken;
        }

        it('type of response should contain json', () => {
            responseTypeShouldContainJson(response);
        })

        it('response status should be 200', () => {
            responseStatusShouldBe(response, 200);
        })

        it('message should be correct', () => {
            messageShouldBe(response, 'Check your email.')
        })

        it('the one time token should be updated', async () => {
            const findedOneTimeToken = await getOneTimeToken({ creator: user._id });
            expect(findedOneTimeToken).not.toEqual(oneTimeToken);
        })
    })


    describe('when request is wrong', () => {
        describe('when username is wrong', () => {
            let user;
            let oneTimeToken;
            beforeAll(async () => {
                user = await createUser(getRandomUserData());
                oneTimeToken = await createOneTimeToken({
                    creator: user._id
                });
            })

            afterAll(async () => {
                await deleteUser({ _id: user._id });
                await deleteOneTimeToken({ creator: user._id })
            })

            let response;
            beforeAll(async () => {
                const wrongUsername = '';
                response = await resetUsernameRequest(wrongUsername);
            })

            it('type of response should contain json', () => {
                responseTypeShouldContainJson(response);
            })

            it('response status should be 400', () => {
                responseStatusShouldBe(response, 400);
            })

            it('message should be correct', () => {
                messageShouldBe(response, 'User does not exist.')
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
        let oneTimeToken;
        let response;
        beforeAll(async () => {
            user = await createUser(getRandomUserData());
            oneTimeToken = await createOneTimeToken({
                creator: user._id
            });
            response = await resetUsernameWithTokenRequest(oneTimeToken.resetUsername.token, {
                data: {
                    oldUsername: user.username,
                    newUsername: 'extraNewUsername123!'
                }
            });
        })

        afterAll(async () => {
            await deleteUser({ _id: user._id })
            await deleteOneTimeToken({ creator: user._id })
        })

        it('type of response should contain json', () => {
            responseTypeShouldContainJson(response);
        })

        it('response status should be 200', () => {
            responseStatusShouldBe(response, 200);
        })

        it('message should be correct', () => {
            messageShouldBe(response, 'Username has been changed successfully.')
        })

        it('user username should be changed', async () => {
            const findedUser = await User.findOne({ _id: user._id });
            expect(findedUser.username).toBe('extraNewUsername123!');
        })
    })


    describe('when request is wrong', () => {
        let user;
        let oneTimeToken;
        beforeAll(async () => {
            user = await createUser(getRandomUserData());
            oneTimeToken = await createOneTimeToken({
                creator: user._id
            });
        })

        afterAll(async () => {
            await deleteUser({ _id: user._id })
            await deleteOneTimeToken({ creator: user._id })
        })
        describe('when the username is the same as the previous one', () => {
            let response;
            beforeAll(async () => {
                response = await resetUsernameWithTokenRequest(oneTimeToken.resetUsername.token, {
                    data: {
                        oldUsername: user.username,
                        newUsername: user.username
                    }
                });
            })

            it('type of response should contain json', () => {
                responseTypeShouldContainJson(response);
            })

            it('response status should be 400', () => {
                responseStatusShouldBe(response, 400);
            })

            it('message should be correct', () => {
                messageShouldBe(response, 'The username is the same as the previous one.')
            })
        })

        describe('when resetUsernameToken is wrong', () => {
            let response;
            beforeAll(async () => {
                const wrongToken = 'wrongToken';
                response = await resetUsernameWithTokenRequest(wrongToken);
            })

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
    })
})