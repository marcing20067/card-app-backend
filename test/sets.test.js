const { set, httpGetByAppWithOptions } = require('./testApi.js');
const app = require('../app');
const mongoose = require('mongoose');

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

describe.skip('/sets/:setId DELETE', () => {
    describe('correct request', () => {
        let response;
        beforeEach(async () => {
            await httpPost(app, '/sets', set);
            const request = httpDelete(app, '/sets');
            response = await setTokenAndMakeHttpRequest(app, request);
        })

        test('response body should be empty object', () => {
            expect(response.body).toEqual({});
        })

        test('response status should be 200', () => {
            expect(response.status).toEqual(200)
        })

        test('response type should contain json', () => {
            expect(/json/.test(response.headers['content-type']))
        });
    })

    // describe('wrong request', () => {
    //     describe('request with empty :setId param', () => {
            
    //     })
    // })
})