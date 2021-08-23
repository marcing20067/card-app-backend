const app = require('../app.js');
const mongoose = require('mongoose');
const { validUser, responseStatusShouldBe, responseTypeShouldContainJson, responseBodyShouldContainProperty, makeHttpRequest, getToken, createValidUser} = require('./testApi.js');
const base64url = require('base64url');
const User = require('../models/user.js');
const OneTimeToken = {};
beforeAll(async () => {
    const user = await createValidUser(app);
})
afterAll(done => {
    mongoose.connection.close()
    done()
})

describe('/reset-username GET', () => {
    describe('correct request', () => {
        let response;
        beforeAll(async () => {
            response = resetUsernameEmailRequest({});
        })

        it('basic correct request tests', () => {
            responseStatusShouldBe(response, 200);
            responseTypeShouldContainJson(response);
        })

        it('message should be exist', () => {
            responseBodyShouldContainProperty(response, 'message');
        })

        it('message should be correct', () => {
            const message = response.body.message;
            expect(message).toEqual('Check your email.')
        })
    })

    describe('wrong request', () => {
        describe('request with wrong access token', () => {
            let response;
            beforeAll(async () => {
                const wrongToken = 'wrongToken';
                response = await resetUsernameEmailRequest({
                    customToken: wrongToken
                });
            })

            it('basic wrong request tests', () => {
                responseTypeShouldContainJson(response);
                responseStatusShouldBe(response, 400);
                responseBodyShouldContainProperty(response, 'message');
            })

            it('message should be correct', () => {
                const message = response.body.message;
                expect(message).toBe('Invalid authentication.')
            })
        })
    })

    const resetUsernameEmailRequest = (options) => {
        const { customToken } = options;
        return makeHttpRequest(app, {
            method: 'GET',
            endpoint: '/reset-username',
            isIncludeToken: true,
            customToken: customToken
        });
    }

})

describe('/reset-username/:token POST', () => {
    describe('correct request', () => {
        let response;

        beforeAll(async () => {
            const oneTimeToken = await getOneTimeToken();
            response = await resetUsernameRequest(
                {
                    data: { newUsername: 'newPerfectUsername', username: validUser.username },
                    oneTimeToken: oneTimeToken
                });
        })

        afterAll(async () => {
            await User.updateOne({ username: 'newPerfectUsername' }, validUser)
        })

        it('basic correct request tests', () => {
            responseTypeShouldContainJson(response);
            responseStatusShouldBe(response, 200);
        })

        it('message should be exist', () => {
            responseBodyShouldContainProperty(response, 'message');
        })

        it('message should be correct', () => {
            const message = response.body.message;
            expect(message).toBe('The username was changed successfully.')
        })

        it('username with new username should exist', async () => {
            const user = await User.findOne({ username: 'newPerfectUsername' });
            expect(user).toBeDefined();
        })
    })

    describe('wrong request', () => {
        describe('request with wrong access token', () => {
            let response;
            beforeAll(async () => {
                const wrongAccessToken = 'wrongToken';
                const oneTimeToken = await getOneTimeToken();
                response = await resetUsernameRequest({
                    oneTimeToken: oneTimeToken,
                    wrongAccessToken: wrongAccessToken
                });
            })

            it('basic wrong request tests', () => {
                responseTypeShouldContainJson(response);
                responseStatusShouldBe(response, 400);
                responseBodyShouldContainProperty(response, 'message');
            })

            it('message should be correct', () => {
                const message = response.body.message;
                expect(message).toEqual('Invalid authentication.');
            })
        })

        describe('request with wrong oneTimeToken', () => {
            beforeAll(async () => {
                const wrongOneTimeToken = 'wrongToken';
                response = await resetUsernameRequest({
                    oneTimeToken: wrongOneTimeToken,
                });
            })

            it('basic wrong request tests', () => {
                responseTypeShouldContainJson(response);
                responseStatusShouldBe(response, 400);
                responseBodyShouldContainProperty(response, 'message');
            })
        })
    })

    const resetUsernameRequest = (options) => {
        const { data, oneTimeToken, customToken } = options;
        return makeHttpRequest(app, {
            method: 'POST',
            endpoint: `/reset-username/${oneTimeToken}`,
            isIncludeToken: true,
            customToken: customToken,
            data: data
        });
    }

    const getOneTimeToken = async () => {
        const userId = await getUserId();
        const oneTimeToken = await OneTimeToken.findOne({
            creator: userId
        })
        return oneTimeToken.token;
    }

    const getUserId = async () => {
        const accessToken = await getToken(app);
        const encodedUserId = accessToken.split('.')[0];
        const decodedUserId = base64url.decode(encodedUserId);
        return decodedUserId;
    }
})



