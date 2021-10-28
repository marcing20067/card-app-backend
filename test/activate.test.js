const app = require('../app');
const mongoose = require('mongoose');
const { makeHttpRequest } = require('./testApi');
const OneTimeToken = require('../models/oneTimeToken');
const User = require('../models/user');

afterAll(done => {
    mongoose.connection.close()
    done();
})

describe('/activate/:token GET', () => {
    let user;
    beforeAll(async () => {
        const unActivatedUser = new User({
            username: 'unActivated',
            password: 'password',
            email: 'xd@mail.pl',
            isActivated: false
        });
        user = await unActivatedUser.save();
    })

    afterAll(async () => {
        await User.deleteOne({ _id: user._id });
    })

    const activateRequest = (activationToken) => {
        return makeHttpRequest(app, {
            method: 'GET',
            endpoint: `/activate/${activationToken}`,
        });
    }

    describe('when request is correct', () => {
        describe('when the token is not expired', () => {
            beforeAll(async () => {
                await User.updateOne({ _id: user._id }, { $set: { isActivated: false } })
            })

            let oneTimeToken;
            beforeAll(async () => {
                const newOneTimeToken = new OneTimeToken({ creator: user._id })
                oneTimeToken = await newOneTimeToken.save();
            })

            let response;
            beforeAll(async () => {
                response = await activateRequest(oneTimeToken.activation.token);
            })

            afterAll(async () => {
                await OneTimeToken.deleteOne({ creator: user._id });
                await User.updateOne({ _id: user._id }, { $set: { isActivated: true } })
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
                expect(message).toBe('The user has been activated successfully.');
            })

            it('the isActivated of user should be true', async () => {
                const findedUser = await User.findById(user._id);
                expect(findedUser.isActivated).toBe(true)
            })
        })
        describe('when the token is expired', () => {
            let oneTimeToken;
            beforeAll(async () => {
                const newOneTimeTokenWithExpiredActivation = new OneTimeToken({
                    activation: {
                        token: 'dasud92ddsay9dsa12IYDsuadia',
                        endOfValidity: 1
                    },
                    creator: user._id
                })
                oneTimeToken = await newOneTimeTokenWithExpiredActivation.save();
            })

            let response;
            beforeAll(async () => {
                response = await activateRequest(oneTimeToken.activation.token);
            })

            afterAll(async () => {
                await OneTimeToken.deleteOne({ creator: oneTimeToken.creator });
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
                expect(message).toBe('The previous token has expired. Check the email and go to the new link.');
            })

            it('the token should be different from the previous one', async () => {
                const findedOneTimeToken = await OneTimeToken.findOne({ creator: oneTimeToken.creator })
                const oldToken = oneTimeToken.activation.token;
                expect(findedOneTimeToken.activation.token).not.toBe(oldToken)
            })
        })
    })

    describe('when request is wrong', () => {
        describe('when oneTimeToken is wrong', () => {
            beforeAll(async () => {
                const wrongOneTimeToken = 'wrongToken';
                response = await activateRequest(wrongOneTimeToken);
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
                expect(message).toBe('Token does not exist.');
            })
        })
    })
})