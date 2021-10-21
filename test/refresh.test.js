const { validUser, responseStatusShouldBe, responseTypeShouldContainJson, responseBodyShouldContainProperty, makeHttpRequest, messageShouldBe, findOrCreateValidUser } = require('./testApi');
const app = require('../app');
const mongoose = require('mongoose');
const jsonwebtoken = require('jsonwebtoken');
jest.mock('jsonwebtoken');

beforeAll(async () => {
    await findOrCreateValidUser();
})
afterAll(done => {
    mongoose.connection.close()
    done()
})


describe.skip('/refresh GET', () => {
    const refreshRequest = (extraOptions) => {
        return makeHttpRequest(app, {
            method: 'GET',
            endpoint: '/refresh',
            isIncludeToken: true,
            ...extraOptions
        });
    }

    describe('when request is correct', () => {
        let response;
        beforeAll(async () => {
            response = await refreshRequest();
        })

        // jsonwebtoken.verify.mockReturnValue({ refreshToken: '3123120d1', accessToken: 'as0d12d901jd2'})

        it('type of response should contain json', () => {
            responseTypeShouldContainJson(response);
        })

        it('response status should be 201', () => {
            responseStatusShouldBe(response, 201);
        })

        it('response body should contain access accessToken and accessTokenExpiresIn', () => {
            responseBodyShouldContainProperty(response, 'accessToken')
            responseBodyShouldContainProperty(response, 'accessTokenExpiresIn')
        })
        // jsonwebtoken.verify.mockRestore()
    })

    describe('when request is invalid', () => {
        describe('when refresh token doesn\'t exist in cookies', () => {
            beforeAll(async () => {
                response = await refreshRequest({
                    customCookie: null
                });
            })

            it('type of response should contain json', () => {
                responseTypeShouldContainJson(response);
            })

            it('response status should be 401', () => {
                responseStatusShouldBe(response, 400);
            })

            it('message should be correct', () => {
                messageShouldBe(response, 'Invalid refresh token.')
            })
        })
    })
})
