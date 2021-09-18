const app = require('../app');
const mongoose = require('mongoose');
const { responseStatusShouldBe, responseTypeShouldContainJson, makeHttpRequest, validUser, messageShouldBe, createOneTimeToken } = require('./testApi');
const OneTimeToken = require('../models/oneTimeToken');
const User = require('../models/user');

const getRandomUserData = () => {
    const letters = 'qwertyuiopasdfghjklzxcvbnm';
    const usernameLength = 8;
    let username = '';
    for (let i = 0; i < usernameLength; i++) {
        const randomIndex = Math.floor(Math.random() * letters.length);
        username = username + letters[randomIndex];
    }
    return {
        ...validUser,
        username: username,
        email: 'changePassword@example.com',
        isActivated: true
    }
}

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

describe('/resetPassword POST', () => {
    const resetPasswordRequest = (username, extraOptions) => {
        return makeHttpRequest(app, {
            method: 'POST',
            endpoint: `/resetPassword`,
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
            response = await resetPasswordRequest(user.username);
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
                response = await resetPasswordRequest(wrongUsername);
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

describe('/resetPassword/:oneTimeToken POST', () => {
    const resetPasswordWithTokenRequest = (resetPasswordToken, extraOptions) => {
        return makeHttpRequest(app, {
            method: 'POST',
            endpoint: `/resetPassword/${resetPasswordToken}`,
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
            response = await resetPasswordWithTokenRequest(oneTimeToken.resetPassword.token, {
                data: {
                    oldPassword: user.password,
                    newPassword: 'extraNewPassword123!'
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
            messageShouldBe(response, 'Password has been changed successfully.')
        })

        it('user password should be changed', async () => {
            const findedUser = await User.findOne({ _id: user._id });
            expect(findedUser.password).toBe('extraNewPassword123!');
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
        describe('when the password is the same as the previous one', () => {
            let response;
            beforeAll(async () => {
                response = await resetPasswordWithTokenRequest(oneTimeToken.resetPassword.token, {
                    data: {
                        oldPassword: user.password,
                        newPassword: user.password
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
                messageShouldBe(response, 'The password is the same as the previous one.')
            })
        })

        describe('when resetPasswordToken is wrong', () => {
            let response;
            beforeAll(async () => {
                const wrongToken = 'wrongToken';
                response = await resetPasswordWithTokenRequest(wrongToken);
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