const app = require('../app');
const mongoose = require('mongoose');
const { responseStatusShouldBe, responseTypeShouldContainJson, makeHttpRequest, tryCreateValidUser, messageShouldBe } = require('./testApi');

const OneTimeToken = require('../models/oneTimeToken');

beforeAll(async () => {
    await tryCreateValidUser();
})

afterAll(done => {
    mongoose.connection.close()
    done()
})

describe('/activate/:token GET', () => {
    const activateRequest = (oneTimeToken) => {
        return makeHttpRequest(app, {
            method: 'GET',
            endpoint: `/activate/${oneTimeToken}`,
        });
    }

    describe('when request is correct', () => {
        const createOneTimeToken = async (customTokenData) => {
            const randomToken = 'dasud92ddsay9dsa12IYDsuadia';
            const oneTimeTokenData = {
                token: randomToken,
                endOfValidity: getEndOfValidity(),
                creator: '6128d701eeb2eb4320fec7aa'
            }

            if (!(await isOneTimeTokenExists({ token: oneTimeTokenData.token }))) {
                const newOneTimeToken = new OneTimeToken({ ...oneTimeTokenData, ...customTokenData });
                await newOneTimeToken.save();
            }
            return { ...oneTimeTokenData, ...customTokenData };
        }

        const isOneTimeTokenExists = async (oneTimeTokenData) => {
            const findedOneTimeToken = await OneTimeToken.findOne(oneTimeTokenData)
            return !!findedOneTimeToken;
        }

        const getEndOfValidity = () => {
            const now = new Date();
            const validEndOfValidity = new Date().setMinutes(now.getMinutes() + 10);
            return validEndOfValidity;
        }

        describe('when the token is not expired', () => {
            let response;
            let createdOneTimeToken;
            beforeAll(async () => {
                const oneTimeToken = await createOneTimeToken({});
                createdOneTimeToken = oneTimeToken;
                response = await activateRequest(oneTimeToken.token);
            })

            afterAll(async () => {
                await deleteOneTimeToken(createdOneTimeToken.token);
            })

            const deleteOneTimeToken = async (token) => {
                await OneTimeToken.deleteOne({ token: token })
            }

            it('type of response should contain json', () => {
                responseTypeShouldContainJson(response);
            })

            it('response status should be 200', () => {
                responseStatusShouldBe(response, 200);
            })

            it('message should be correct', () => {
                messageShouldBe(response, 'The user has been activated successfully.')
            })

            it('the token should be different from the previous one', async () => {
                const findedOneTimeToken = await OneTimeToken.findOne({ creator: createdOneTimeToken.creator })
                const oldToken = createdOneTimeToken.token;
                expect(findedOneTimeToken.token).not.toBe(oldToken)
            })
        })
        describe('when the token is expired', () => {
            let response;
            let createdOneTimeToken;
            beforeAll(async () => {
                const oneTimeToken = await createOneTimeToken({
                    endOfValidity: 1
                });
                createdOneTimeToken = oneTimeToken;
                response = await activateRequest(oneTimeToken.token);
            })

            afterAll(async () => {
                await deleteOneTimeToken(createdOneTimeToken.token);
            })

            const deleteOneTimeToken = async (token) => {
                await OneTimeToken.deleteOne({ token: token })
            }

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
                const oldToken = createdOneTimeToken.token;
                expect(findedOneTimeToken.token).not.toBe(oldToken)
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
