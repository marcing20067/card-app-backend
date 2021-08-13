const { set, httpGetByAppWithOptions, httpDeleteByAppWithOptions } = require('./testApi.js');
const app = require('../app');
const mongoose = require('mongoose');
const Set = require('../models/set')

afterAll(done => {
    mongoose.connection.close()
    done();
})

describe('/sets GET', () => {
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

    it('response body should be type object', () => {
        expect(typeof response.body).toEqual('object')
    })
})


describe('/sets/:setId GET', () => {
    let setId;
    beforeAll(async () => {
        await httpGetByAppWithOptions(app, {
            endpoint: '/sets',
            isIncludeToken: true
        })
            .then(res => {
                const sets = res.body;
                if (sets.length > 0) {
                    setId = sets[0]._id;
                }
            });

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

    it('response body should be type object', () => {
        expect(typeof response.body).toEqual('object')
    })
})

describe('/sets/:setId DELETE', () => {
    describe('correct request', () => {
        let response;
        let setId;
        beforeAll(async () => {
            const newSet = new Set(set);
            try {
                const addedSet = await newSet.save();
                setId = addedSet._id;
            } catch(e) {
                throw new Error(e);
            }
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
        })
    })
})