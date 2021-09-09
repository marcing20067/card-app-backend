const app = require('../app');
const mongoose = require('mongoose');
const { responseStatusShouldBe, responseTypeShouldContainJson, makeHttpRequest, findOrCreateValidUser, messageShouldBe, validUser } = require('./testApi');

const OneTimeToken = require('../models/oneTimeToken');
const User = require('../models/user');

let user;
beforeAll(async () => {
   user = await createUnactivatedUser();
})

const createUnactivatedUser = async () => {
    const newUser = new User({
        username: 'unActivated',
        password: 'password',
        email: 'xd@mail.pl',
        isActivated: false
    });
    const createdUser = await newUser.save();
    return createdUser;
}

afterAll(async () => {
    await deleteUser({
        username: 'unActivated',
        password: 'password',
        email: 'xd@mail.pl'
    })
})

afterAll(done => {
    mongoose.connection.close()
    done();
})

const deleteUser = async (filterData) => {
    await User.deleteOne(filterData);
}

describe('/activate/:token GET', () => {
    const activateRequest = (activationToken) => {
        return makeHttpRequest(app, {
            method: 'GET',
            endpoint: `/activate/${activationToken}`,
        });
    }

    describe('when request is correct', () => {
        const createOneTimeToken = async (customTokenData) => {
            const randomToken = 'dasud92ddsay9dsa12IYDsuadia';
            const oneTimeTokenData = {
                resetPassword: {
                    token: randomToken,
                    endOfValidity: generateEndOfValidity()
                },
                resetNickname: {
                    token: randomToken,
                    endOfValidity: generateEndOfValidity()
                },
                activation: {
                    token: randomToken,
                    endOfValidity: generateEndOfValidity()
                },
                creator: user._id,
                ...customTokenData
            }

            if (!(await isOneTimeTokenExists({ creator: user._id }))) {
                const newOneTimeToken = new OneTimeToken({ ...oneTimeTokenData });
                await newOneTimeToken.save();
            }
            return { ...oneTimeTokenData };
        }

        const isOneTimeTokenExists = async (oneTimeTokenData) => {
            const findedOneTimeToken = await OneTimeToken.findOne(oneTimeTokenData)
            return !!findedOneTimeToken;
        }

        const generateEndOfValidity = () => {
            const now = new Date();
            const validEndOfValidity = new Date().setMinutes(now.getMinutes() + 10);
            return validEndOfValidity;
        }

        const deleteOneTimeToken = async (filterData) => {
            await OneTimeToken.deleteOne(filterData)
        }

        describe('when the token is not expired', () => {
            let response;
            beforeAll(async () => {
                await setisActivatedToValueForUser(false)
            })
            const setisActivatedToValueForUser = async (value) => {
                await User.updateOne({ _id: user._id }, { $set: { isActivated: value}})
            }
            beforeAll(async () => {
                const oneTimeToken = await createOneTimeToken();
                response = await activateRequest(oneTimeToken.activation.token);
            })

            afterAll(async () => {
                await deleteOneTimeToken({ creator: user._id });
                await setisActivatedToValueForUser(true)
            })

            it('type of response should contain json', () => {
                responseTypeShouldContainJson(response);
            })

            it('response status should be 200', () => {
                responseStatusShouldBe(response, 200);
            })

            it('message should be correct', () => {
                messageShouldBe(response, 'The user has been activated successfully.')
            })

            it('the isActivated of user should be true', async () => {
                const findedUser = await User.findOne({ ...validUser });
                expect(findedUser.isActivated).toBe(true)
            })
        })
        describe('when the token is expired', () => {
            let response;
            let createdOneTimeToken;
            beforeAll(async () => {
                const oneTimeToken = await createOneTimeToken({
                    activation: {
                        token: 'dasud92ddsay9dsa12IYDsuadia',
                        endOfValidity: 1
                    }
                });
                createdOneTimeToken = oneTimeToken;
                response = await activateRequest(oneTimeToken.activation.token);
            })

            afterAll(async () => {
                await deleteOneTimeToken({ 'creator': createdOneTimeToken.creator });
            })



            it('type of response should contain json', () => {
                responseTypeShouldContainJson(response);
            })

            it('response status should be 200', () => {
                responseStatusShouldBe(response, 200);
            })

            it('message should be correct', () => {
                messageShouldBe(response, 'The previous token has expired. Check the email and go to the new link.')
            })

            it('the token should be different from the previous one', async () => {
                const findedOneTimeToken = await OneTimeToken.findOne({ creator: createdOneTimeToken.creator })
                const oldToken = createdOneTimeToken.activation.token;
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
                responseTypeShouldContainJson(response);
            })

            it('response status should be 400', () => {
                responseStatusShouldBe(response, 400);
            })

            it('message should be correct', () => {
                messageShouldBe(response, 'Token does not exist.')
            })
        })
    })
})
