const { validSet, makeHttpRequest, createValidUser, createValidSet } = require('./testApi');
const app = require('../app');
const mongoose = require('mongoose');
const Set = require('../models/set');
const User = require('../models/user');

let user;
beforeAll(async () => {
    user = await createValidUser()
})

afterAll(async () => {
    await User.findByIdAndDelete(user._id)
})

afterAll(done => {
    mongoose.connection.close()
    done();
})

describe('/sets GET', () => {
    const setsRequest = (extraOptions) => {
        return makeHttpRequest(app, {
            method: 'GET',
            endpoint: '/sets',
            isIncludeToken: true,
            customJwtVerifyReturn: user,
            ...extraOptions
        })
    }

    describe('when request is correct', () => {
        let response;
        beforeAll(async () => {
            response = await setsRequest();
        })

        it('type of response should contain json', () => {
            const contentType = response.headers['content-type'];
            expect(/json/.test(contentType))
        })

        it('response status should be 200', () => {
            expect(response.status).toBe(200);
        })
    })
})

describe('/sets/:setId GET', () => {
    const getSetRequest = (setId, extraOptions) => {
        return makeHttpRequest(app, {
            method: 'GET',
            endpoint: `/sets/${setId}`,
            isIncludeToken: true,
            customJwtVerifyReturn: user,
            ...extraOptions
        });
    }

    describe('when request is correct', () => {
        let setId;
        beforeAll(async () => {
            const createdSet = await createValidSet({ creator: user._id });
            setId = createdSet._id;
        })

        let response;
        beforeAll(async () => {
            response = await getSetRequest(setId);
        })

        afterAll(async () => {
            await Set.findByIdAndDelete(setId);
        })

        it('type of response should contain json', () => {
            const contentType = response.headers['content-type'];
            expect(/json/.test(contentType))
        })

        it('response status should be 200', () => {
            expect(response.status).toBe(200);
        })

        it('response body should be a set', () => {
            expect(response.body).toHaveProperty('_id');
            expect(response.body).toHaveProperty('name');
            expect(response.body).toHaveProperty('cards');
            expect(response.body).toHaveProperty('stats');
            expect(response.body).toHaveProperty('creator');
        })
    })

    describe('when request is wrong', () => {
        describe('request with wrong setId', () => {
            let response;
            beforeAll(async () => {
                const wrongSetId = 'wrongSetId';
                response = await getSetRequest(wrongSetId);
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

describe('/sets/:setId PUT', () => {
    const putSetRequest = (setId, newSet, extraOptions) => {
        return makeHttpRequest(app, {
            method: 'PUT',
            endpoint: `/sets/${setId}`,
            isIncludeToken: true,
            data: newSet,
            customJwtVerifyReturn: user,
            ...extraOptions
        });
    }

    describe('when request is correct', () => {
        let setId;
        beforeAll(async () => {
            const createdSet = await createValidSet({ creator: user._id });
            setId = createdSet._id;
        });

        let response;
        beforeAll(async () => {
            const updatedSet = { ...validSet, name: 'edited!' };
            response = await putSetRequest(setId, updatedSet);
        })

        afterAll(async () => {
            await Set.findByIdAndDelete(setId);
        })

        it('type of response should contain json', () => {
            const contentType = response.headers['content-type'];
            expect(/json/.test(contentType))
        })

        it('response status should be 200', () => {
            expect(response.status).toBe(200);
        })

        it('response body should contain set', () => {
            expect(response.body).toHaveProperty('_id');
            expect(response.body).toHaveProperty('name');
            expect(response.body).toHaveProperty('cards');
            expect(response.body).toHaveProperty('stats');
            expect(response.body).toHaveProperty('creator');
        })

        it('name of edited set should be "edited!"', () => {
            expect(response.body.name).toEqual('edited!');
        })

        it('updated set should exists in db', () => {
            const findedSet = Set.findOne({ name: 'edited!', _id: setId });
            expect(findedSet).not.toBe(null);
        })
    })
    describe('when request is wrong', () => {
        describe('when :setId param is wrong', () => {
            beforeAll(async () => {
                const wrongSetId = 'wrongSetId';
                const updatedSet = { ...validSet, name: 'edited!' };
                response = await putSetRequest(wrongSetId, updatedSet);
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
        describe('when new set is undefined', () => {
            let setId;
            beforeAll(async () => {
                const set = await createValidSet();
                setId = set._id;
            })

            let response;
            beforeAll(async () => {
                const newSet = undefined;
                response = await putSetRequest(setId, newSet);
            })

            afterAll(async () => {
                await Set.findByIdAndDelete(setId);
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
                expect(message).toBe('Name is required.');
            })
        })
        describe('when only name is undefined', () => {
            let setId
            beforeAll(async () => {
                const createdSet = await createValidSet({ creator: user._id });
                setId = createdSet._id;
            })

            let response;
            beforeAll(async () => {
                const updatedSet = { ...validSet, name: undefined };
                response = await putSetRequest(setId, updatedSet);
            })

            afterAll(async () => {
                await Set.findByIdAndDelete(setId);
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
                expect(message).toBe('Name is required.');
            })
        })

        describe('when only cards is undefined', () => {
            let setId
            beforeAll(async () => {
                const createdSet = await createValidSet({ creator: user._id });
                setId = createdSet._id;
            })

            beforeAll(async () => {
                const newSet = { ...validSet, cards: undefined };
                response = await putSetRequest(setId, newSet);
            })

            afterAll(async () => {
                await Set.findByIdAndDelete(setId);
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
                expect(message).toBe('Cards is required.');
            })
        })

        describe('when only stats is undefined', () => {
            let setId;
            beforeAll(async () => {
                const createdSet = await createValidSet({ creator: user._id });
                setId = createdSet._id;
            })

            beforeAll(async () => {
                const newSet = { ...validSet, stats: undefined };
                response = await putSetRequest(setId, newSet);
            })

            afterAll(async () => {
                await Set.findByIdAndDelete(setId);
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
                expect(message).toBe('Stats is required.');
            })
        })
    })
})

describe('/sets/:setId DELETE', () => {
    const deleteSetRequest = (setId, extraOptions) => {
        return makeHttpRequest(app, {
            method: 'DELETE',
            endpoint: `/sets/${setId}`,
            isIncludeToken: true,
            customJwtVerifyReturn: user,
            ...extraOptions
        });
    }

    describe('when request is correct', () => {
        let setId;
        beforeAll(async () => {
            const createdSet = await createValidSet({ creator: user._id });
            setId = createdSet._id;
        })

        let response;
        beforeAll(async () => {
            response = await deleteSetRequest(setId);
        })

        afterAll(async () => {
            await Set.findByIdAndDelete(setId);
        })

        it('type of response should contain json', () => {
            const contentType = response.headers['content-type'];
            expect(/json/.test(contentType))
        })

        it('response status should be 200', () => {
            expect(response.status).toBe(200);
        })
    })

    describe('wrong request', () => {
        describe('request with wrong :setId param', () => {
            let response;
            beforeAll(async () => {
                const wrongSetId = '3213213wrongparam123123';
                response = await deleteSetRequest(wrongSetId);
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

describe('/sets/:setId POST', () => {
    const postSetRequest = (newSet, extraOptions) => {
        return makeHttpRequest(app, {
            method: 'POST',
            endpoint: '/sets',
            isIncludeToken: true,
            data: newSet,
            customJwtVerifyReturn: user,
            ...extraOptions
        })
    }

    describe('when request is correct', () => {
        let response;
        let createdSetId;
        beforeAll(async () => {
            response = await postSetRequest(validSet);
            createdSetId = response.body._id;
        })

        afterAll(async () => {
            await deleteSet({
                _id: createdSetId
            })
        })

        const deleteSet = async (setData) => {
            await Set.deleteOne(setData)
        }

        it('type of response should contain json', () => {
            const contentType = response.headers['content-type'];
            expect(/json/.test(contentType))
        })

        it('response status should be 201', () => {
            expect(response.status).toBe(201)
        })

        it('response body should contain set data', () => {
            expect(response.body).toHaveProperty('_id');
            expect(response.body).toHaveProperty('name');
            expect(response.body).toHaveProperty('cards');
            expect(response.body).toHaveProperty('stats');
            expect(response.body).toHaveProperty('creator');
        })

        it('created set should exists in db', async () => {
            const findedSet = await Set.findOne({ _id: createdSetId })
            expect(findedSet).not.toBe(null);
        })
    })

    describe('when request is wrong', () => {
        describe('when only name is required', () => {
            let response;
            beforeAll(async () => {
                response = await postSetRequest({ ...validSet, name: undefined });
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
                expect(message).toBe('Name is required.');
            })
        })

        describe('when only stats is undefined', () => {
            let response;
            beforeAll(async () => {
                response = await postSetRequest({ ...validSet, stats: undefined });
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
                expect(message).toBe('Stats is required.');
            })
        })

        describe('when name is too short', () => {
            let response;
            beforeAll(async () => {
                response = await postSetRequest({ ...validSet, name: 'n' });
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
                expect(message).toBe('Name is too short.');
            })
        })
    })
})