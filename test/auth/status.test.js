const { makeHttpRequest, createValidUser, newUser, validUser } = require('../testApi');
const app = require('../../app');
const mongoose = require('mongoose');
const User = require('../../models/user');

let user;
beforeAll(async () => {
    user = await createValidUser();
})

afterAll(async () => {
    await User.deleteOne({ _id: user._id })
})

afterAll(done => {
    mongoose.connection.close()
    done();
})


describe('/status GET', () => {
    const statusRequest = (extraOptions) => {
        return makeHttpRequest(app, {
            method: 'GET',
            endpoint: '/auth/status',
            isIncludeToken: true,
            customJwtVerifyReturn: user,
            ...extraOptions
        })
    }

    describe('when request is correct', () => {
        let response;
        beforeAll(async () => {
            response = await statusRequest();
        })

        it('type of response should contain json', () => {
            const contentType = response.headers['content-type'];
            expect(/json/.test(contentType))
        })

        it('response status should be 200', () => {
            expect(response.status).toBe(200);
        })

        it('response body should contain email, username fields', () => {
            expect(response.body).toHaveProperty('email');
            expect(response.body).toHaveProperty('username');
        })

        it('email & username should be correct', () => {
            expect(response.body.email).toBe(user.email);
            expect(response.body.username).toBe(user.username);
        })
    })

    describe('wrong request', () => {
        describe('when jwt return id another user', () => {
            let response;
            beforeAll(async () => {
                response = await statusRequest({
                    customJwtVerifyReturn: { id: '5d6ede6a0ba62570afcedd3a' }
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

        describe('when jwt return wrong user id', () => {
            let response;
            beforeAll(async () => {
                response = await statusRequest({
                    customJwtVerifyReturn: { id: 'dasd12d' }
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
