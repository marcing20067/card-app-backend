const { set, validUserData, makeHttpReqByAppWithOptions } = require('./testApi.js');
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
            response = await setsRequest();
        })

        const setsRequest = () => {
            return makeHttpReqByAppWithOptions(app, {
                method: 'GET',
                endpoint: '/sets',
                isIncludeToken: true
            })
        }

        it('response type should include aplication/json', () => {
            expect(/json/.test(response.headers['content-type']))
        })

        it('response status should be 200', () => {
            expect(response.status).toEqual(200)
        })
    })
    describe('wrong request', () => {
        describe('request with wrong token', () => {
            let response;

            beforeAll(async () => {
                const wrongToken = 'wrongToken';
                response = await setsRequestWithCustomToken(wrongToken);
            })

            const setsRequestWithCustomToken = async (token) => {
                return makeHttpReqByAppWithOptions(app, {
                    method: 'GET',
                    endpoint: '/sets',
                    customToken: token,
                })
            }

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


    describe('/sets/:setId GET', () => {
        const setRequestBySetId = (setId) => {
            return makeHttpReqByAppWithOptions(app, {
                method: 'GET',
                endpoint: `/sets/${setId}`,
                isIncludeToken: true
            });
        }

        describe('correct request', () => {
            let response;
            beforeAll(async () => {
                const setId = await findOrCreateSetAndReturnSetId();
                response = await setRequestBySetId(setId);
            })

            const findOrCreateSetAndReturnSetId = async () => {
                const userId = await findUserAndReturnUserId();
                const findedSet = await Set.findOne({ creator: userId });
                if (findedSet) {
                    return findedSet._id;
                } else {
                    const newSet = new Set({ ...set, creator: userId });
                    const createdSet = await newSet.save();
                    return createdSet._id;
                }
            }

            const findUserAndReturnUserId = async () => {
                const findedUser = await User.findOne(validUserData);
                return findedUser._id;
            }

            it('response status should be 200', () => {
                expect(response.status).toEqual(200)
            })

            it('response type should include aplication/json', () => {
                expect(/json/.test(response.headers['content-type']))
            })

            it('response body should be a set', () => {
                expect(response.body.hasOwnProperty('_id'))
                expect(response.body.hasOwnProperty('name'))
                expect(response.body.hasOwnProperty('cards'))
                expect(response.body.hasOwnProperty('stats'))
                expect(response.body.hasOwnProperty('creator'))
            })
        })

        describe('wrong request', () => {
            describe('request with wrong setId', () => {
                let response;
                beforeAll(async () => {
                    const wrongSetId = 'wrongSetId';
                    response = await setRequestBySetId(wrongSetId);
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
        const deleteSetBySetId = (setId) => {
            return makeHttpReqByAppWithOptions(app, {
                method: 'DELETE',
                endpoint: `/sets/${setId}`,
                isIncludeToken: true
            });
        }

        describe('correct request', () => {
            let response;
            beforeAll(async () => {
                const setId = await createSetAndReturnSetId();
                response = await deleteSetBySetId(setId);
            })

            const createSetAndReturnSetId = async () => {
                const newSet = new Set(set);
                const addedSet = await newSet.save();
                return addedSet._id;
            }

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
                    const wrongSetId = '3213213wrongparam123123';
                    response = await deleteSetBySetId(wrongSetId);
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
})