const { set, httpGetByAppWithOptions, httpPostByAppWithOptions, httpDeleteByAppWithOptions, validUserData, validUserData2, httpRequestByApp } = require('./testApi.js');
const app = require('../app');
const mongoose = require('mongoose');
const Set = require('../models/set');
const User = require('../models/user.js');

afterAll(done => {
    mongoose.connection.close()
    done();
})

describe('/sets GET', () => {
    describe('correct request', () => {
        let response;
        beforeAll(async () => {
            response = await httpGetByAppWithOptions(app, {
                endpoint: '/sets',
                isIncludeToken: true
            })
        })

        it('response type should include aplication/json', () => {
            expect(/json/.test(response.headers['content-type']))
        })

        it('response status should be 200', () => {
            expect(response.status).toEqual(200)
        })
    })
    describe('wrong request', () => {
        describe('request with wrong creator', () => {
            let response;
            let user2Token;
            beforeAll(async () => {
                user2Data = await httpPostByAppWithOptions(app, {
                    endpoint: '/login',
                    data: validUserData2
                })
                user2Token = user2Data.accessToken;
            })
            beforeAll(async () => {
                response = await httpRequestByApp(app)
                    .get('/sets')
                    .set('Authorization', 'Bearer' + user2Token);
            })

            it('response status should be 401', () => {
                expect(response.status).toEqual(401)
            })

            it('response body should contain message', () => {
                expect(response.body.hasOwnProperty('message'))
            })

            it('message should be correct', () => {
                expect(response.body.message).toEqual('Invalid authorization.');
            })
        })
    })
})


describe('/sets/:setId GET', () => {
    describe('correct request', () => {
        let userId;
        beforeAll(async () => {
            const findedUser = await User.findOne(validUserData);
            userId = findedUser._id;
        })
        let setId;
        beforeAll(async () => {
            const findedSet = await Set.findOne({ creator: userId });
            if (findedSet) {
                setId = findedSet._id;
            } else {
                const newSet = new Set({ ...set, creator: userId });
                const createdSet = await newSet.save();
                return createdSet._id;
            }
        })
        let response;
        beforeAll(async () => {
            response = await httpGetByAppWithOptions(app, {
                endpoint: `/sets/${setId}`,
                isIncludeToken: true
            });
        })

        it('response status should be 200', () => {
            expect(response.status).toEqual(200)
        })

        it('response type should include aplication/json', () => {
            expect(/json/.test(response.headers['content-type']))
        })
    })

    describe('wrong request', () => {
        describe('request with wrong setId', () => {
            let response;
            beforeAll(async () => {
                response = await httpGetByAppWithOptions(app, {
                    endpoint: `/sets/wrongid302d21dk12d1`,
                    isIncludeToken: true
                })
            })

            it('response status should be 400', () => {
                expect(response.status).toEqual(400)
            })

            it('response type should include aplication/json', () => {
                expect(/json/.test(response.headers['content-type']))
            })

            it('response body should contain message', () => {
                expect(response.body.hasOwnProperty('message'))
            })

            it('message should be correct', () => {
                expect(response.body.message).toEqual('Invalid request data.');
            })
        })
    })


})

describe('/sets/:setId DELETE', () => {
    describe('correct request', () => {
        let response;
        let setId;
        beforeAll(async () => {
            const newSet = new Set(set);
            const addedSet = await newSet.save();
            setId = addedSet._id;
        })
        beforeAll(async () => {
            response = await httpDeleteByAppWithOptions(app, {
                endpoint: `/sets/${setId}`,
                isIncludeToken: true
            })
        })

        it('response body should be empty object', () => {
            expect(response.body).toEqual({});
        })

        it('response status should be 200', () => {
            expect(response.status).toEqual(200)
        })

        it('response type should contain json', () => {
            expect(/json/.test(response.headers['content-type']))
        });
    })

    describe('wrong request', () => {
        describe('request with wrong :setId param', () => {
            let response;
            beforeAll(async () => {
                response = await httpDeleteByAppWithOptions(app, {
                    endpoint: '/sets/3213213wrongparam123123',
                    isIncludeToken: true
                })
            })

            it('response status should be 400', () => {
                expect(response.status).toEqual(400);
            })

            it('response type should contain json', () => {
                expect(/json/.test(response.headers['content-type']));
            });

            it('response body should contain message', () => {
                expect(response.body.hasOwnProperty('message')).toEqual(true);
            })

            it('message should be correct', () => {
                expect(response.body.message).toEqual('Invalid request data.');
            })
        })
    })
})