const app = require('../app.js');
const mongoose = require('mongoose');
const { responseStatusShouldBe, responseTypeShouldContainJson, responseBodyShouldContainProperty, makeHttpRequest, getToken, createValidUser } = require('./testApi.js');

const OneTimeToken = require('../models/oneTimeToken.js');

beforeAll(async () => {
    await createValidUser();
})
afterAll(done => {
    mongoose.connection.close()
    done()
})

const activateRequest = (oneTimeToken) => {
    return makeHttpRequest(app, {
        method: 'GET',
        endpoint: `/activate/${oneTimeToken}`,
    });
}

describe('/activate/:token GET', () => {
    describe('correct request', () => {
        let response;

        beforeAll(async () => {
            const oneTimeToken = await findOrCreateOneTimeToken();
            response = await activateRequest(oneTimeToken.token);
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
            expect(message).toBe('The user has been activated successfully.')
        })
    })

    describe('wrong request', () => {
        describe('request with wrong oneTimeToken', () => {
            beforeAll(async () => {
                const wrongOneTimeToken = 'wrongToken';
                response = await activateRequest(wrongOneTimeToken);
            })

            it('basic wrong request tests', () => {
                responseTypeShouldContainJson(response);
                responseStatusShouldBe(response, 400);
                responseBodyShouldContainProperty(response, 'message');
            })

            it('message should be correct', () => {
                const message = response.body.message;
                expect(message).toBe('Token does not exist.');
            })
        })
    })

    const findOrCreateOneTimeToken = async () => {
        const randomToken = 'dasud92ddsay9dsa12IYDsuadia'; 
        const oneTimeTokenData = {
            token: randomToken,
            endOfValidity: getEndOfValidity(),
            creator: '6128d701eeb2eb4320fec7aa'
        }
        try {
            const oneTimeToken = await OneTimeToken.findOne(oneTimeTokenData);

            if (!oneTimeToken) {
                const newOneTimeToken = new OneTimeToken(oneTimeTokenData);
                await newOneTimeToken.save();
            }
        } finally {
            return oneTimeTokenData;
        }
    }

    const getEndOfValidity = () => {
        const now = new Date();
        const validEndOfValidity = new Date().setMinutes(now.getMinutes() + 10);
        return validEndOfValidity;
    }
})
