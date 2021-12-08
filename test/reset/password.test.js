const app = require('../../app');
const mongoose = require('mongoose');
const { makeHttpRequest, createValidUser } = require('../testApi');
const OneTimeToken = require('../../models/oneTimeToken');
const User = require('../../models/user');

afterAll(done => {
    mongoose.connection.close()
    done();
})


describe('/resetPassword POST', () => {
    const resetPasswordRequest = (username, extraOptions) => {
        return makeHttpRequest(app, {
            method: 'POST',
            endpoint: `/reset/password`,
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
            oneTimeToken = new OneTimeToken({
                creator: user._id
            });
        })

        afterAll(async () => {
            await User.deleteOne({ _id: user._id });
            await OneTimeToken.deleteOne({ creator: user._id });
        })

        let response;
        beforeAll(async () => {
            response = await resetPasswordRequest(user.username);
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
                })
                oneTimeToken = await newOneTimeToken.save();
            })

            afterAll(async () => {
                await User.deleteOne({ _id: user._id });
                await OneTimeToken.deleteOne({ creator: user._id });
            })

            let response;
            beforeAll(async () => {
                const wrongUsername = '';
                response = await resetPasswordRequest(wrongUsername);
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

describe('/resetPassword/:oneTimeToken POST', () => {
    const resetPasswordWithTokenRequest = (resetPasswordToken, extraOptions) => {
        return makeHttpRequest(app, {
            method: 'POST',
            endpoint: `/reset/password/${resetPasswordToken}`,
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
            response = await resetPasswordWithTokenRequest(oneTimeToken.resetPassword.token, {
                data: {
                    currentPassword: user.password,
                    newPassword: 'extraNewPassword123!'
                }
            });
        })

        afterAll(async () => {
            await User.deleteOne({ _id: user._id });
            await OneTimeToken.deleteOne({ creator: user._id });
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
            expect(message).toBe('Password has been changed successfully.');
        })

        it('user password should be changed', async () => {
            const findedUser = await User.findOne({ _id: user._id });
            expect(findedUser.password).toBe('extraNewPassword123!');
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
            await User.deleteOne({ _id: user._id });
            await OneTimeToken.deleteOne({ creator: user._id });
        })
        describe('when the password is the same as the previous one', () => {
            let response;
            beforeAll(async () => {
                response = await resetPasswordWithTokenRequest(oneTimeToken.resetPassword.token, {
                    data: {
                        currentPassword: user.password,
                        newPassword: user.password
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
                expect(message).toBe('The password is the same as the previous one.');
            })
        })

        describe('when resetPasswordToken is wrong', () => {
            let response;
            beforeAll(async () => {
                const wrongToken = 'wrongToken';
                response = await resetPasswordWithTokenRequest(wrongToken, {
                    data: {
                        currentPassword: user.password,
                        newPassword: user.password + 'new'
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
                expect(message).toBe('Invalid request data.');
            })
        })
    })
})