const { validSet, validUser, responseStatusShouldBe, responseTypeShouldContainJson, responseBodyShouldContainProperty, makeHttpRequest, messageShouldBe, tryCreateValidUser } = require('./testApi.js');
const app = require('../app');
const mongoose = require('mongoose');
const Set = require('../models/set');
const User = require('../models/user.js');

afterAll(done => {
    mongoose.connection.close()
    done();
})

beforeAll(async () => {
    await tryCreateValidUser();
})

describe('/sets GET', () => {
    const setsRequest = (extraOptions) => {
        return makeHttpRequest(app, {
            method: 'GET',
            endpoint: '/sets',
            isIncludeToken: true,
            ...extraOptions
        })
    }

    describe('when request is correct', () => {
        let response;
        beforeAll(async () => {
            response = await setsRequest();
        })

        it('type of response should contain json', () => {
            responseTypeShouldContainJson(response);
        })

        it('response status should be 200', () => {
            responseStatusShouldBe(response, 200);
        })
    })
    describe('when request is wrong', () => {
        describe('when access token is wrong', () => {
            let response;

            beforeAll(async () => {
                response = await setsRequest({
                    customToken: 'wrongToken'
                });
            })

            it('type of response should contain json', () => {
                responseTypeShouldContainJson(response);
            })

            it('response status should be 401', () => {
                responseStatusShouldBe(response, 401);
            })

            it('message should be correct', () => {
                messageShouldBe(response, 'Invalid authorization.')
            })
        })
    })
})

const findOrCreateSet = async () => {
    const user = await findUser();
    const findedSet = await Set.findOne({ creator: user._id });
    if (findedSet) {
        return findedSet;
    } else {
        const newSet = new Set({ ...validSet, creator: user._id });
        const createdSet = await newSet.save();
        return createdSet;
    }
}

const findUser = async () => {
    const findedUser = await User.findOne(validUser);
    return findedUser;
}

describe('/sets/:setId GET', () => {
    const getSetRequest = (setId, extraOptions) => {
        return makeHttpRequest(app, {
            method: 'GET',
            endpoint: `/sets/${setId}`,
            isIncludeToken: true,
            ...extraOptions
        });
    }

    describe('correct request', () => {
        let response;
        beforeAll(async () => {
            const set = await findOrCreateSet();
            const setId = set._id;
            response = await getSetRequest(setId);
        })

        it('type of response should contain json', () => {
            responseTypeShouldContainJson(response);
        })

        it('response status should be 200', () => {
            responseStatusShouldBe(response, 200);
        })

        it('response body should be a set', () => {
            responseBodyShouldContainProperty(response, '_id');
            responseBodyShouldContainProperty(response, 'name');
            responseBodyShouldContainProperty(response, 'cards');
            responseBodyShouldContainProperty(response, 'stats');
            responseBodyShouldContainProperty(response, 'creator');
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
                responseTypeShouldContainJson(response);
            })

            it('response status should be 400', () => {
                responseStatusShouldBe(response, 400);
            })

            it('message should be correct', () => {
                messageShouldBe(response, 'Invalid request data.')
            })
        })

        describe('when access token is invalid', () => {
            let response;
            beforeAll(async () => {
                response = await getSetRequest(null, {
                    customToken: 'wrong',
                });
            })

            it('type of response should contain json', () => {
                responseTypeShouldContainJson(response);
            })

            it('response status should be 401', () => {
                responseStatusShouldBe(response, 401);
            })

            it('message should be correct', () => {
                messageShouldBe(response, 'Invalid authorization.')
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
            ...extraOptions
        });
    }

    describe('when request is correct', () => {
        let setId;
        let response;
        beforeAll(async () => {
            const set = await findOrCreateSet();
            setId = set._id;
            const newSet = { ...validSet, name: 'edited!' };
            response = await putSetRequest(setId, newSet);
        })

        it('type of response should contain json', () => {
            responseTypeShouldContainJson(response);
        })

        it('response status should be 200', () => {
            responseStatusShouldBe(response, 200);
        })

        it('response body should contain set', () => {
            responseBodyShouldContainProperty(response, '_id')
            responseBodyShouldContainProperty(response, 'name')
            responseBodyShouldContainProperty(response, 'cards')
            responseBodyShouldContainProperty(response, 'stats')
            responseBodyShouldContainProperty(response, 'creator')

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
        describe('when access token is invalid', () => {
            let response;
            beforeAll(async () => {
                response = await putSetRequest(null, null, {
                    customToken: 'wrong',
                });
            })

            it('type of response should contain json', () => {
                responseTypeShouldContainJson(response);
            })

            it('response status should be 401', () => {
                responseStatusShouldBe(response, 401);
            })

            it('message should be correct', () => {
                messageShouldBe(response, 'Invalid authorization.')
            })
        })

        describe('when :setId param is wrong', () => {
            beforeAll(async () => {
                const wrongSetId = 'wrongSetId';
                const newSet = { ...validSet, name: 'edited!' };
                response = await putSetRequest(wrongSetId, newSet);
            })

            it('type of response should contain json', () => {
                responseTypeShouldContainJson(response);
            })

            it('response status should be 400', () => {
                responseStatusShouldBe(response, 400);
            })

            it('message should be correct', () => {
                messageShouldBe(response, 'Invalid request data.')
            })
        })
        describe('when new set is undefined', () => {
            beforeAll(async () => {
                const set = await findOrCreateSet();
                const setId = set._id;
                const newSet = undefined;
                response = await putSetRequest(setId, newSet);
            })

            it('type of response should contain json', () => {
                responseTypeShouldContainJson(response);
            })

            it('response status should be 400', () => {
                responseStatusShouldBe(response, 400);
            })

            it('message should be correct', () => {
                messageShouldBe(response, 'Name is required.')
            })
        })
        describe('when only name is undefined', () => {
            beforeAll(async () => {
                const set = await findOrCreateSet();
                const setId = set._id;
                const newSet = { ...validSet, name: undefined };
                response = await putSetRequest(setId, newSet);
            })

            it('type of response should contain json', () => {
                responseTypeShouldContainJson(response);
            })

            it('response status should be 400', () => {
                responseStatusShouldBe(response, 400);
            })

            it('message should be correct', () => {
                messageShouldBe(response, 'Name is required.')
            })
        })

        describe('when only cards is undefined', () => {
            beforeAll(async () => {
                const set = await findOrCreateSet();
                const setId = set._id;
                const newSet = { ...validSet, cards: undefined };
                response = await putSetRequest(setId, newSet);
            })

            it('type of response should contain json', () => {
                responseTypeShouldContainJson(response);
            })

            it('response status should be 400', () => {
                responseStatusShouldBe(response, 400);
            })

            it('message should be correct', () => {
                messageShouldBe(response, 'Cards is required.')
            })
        })

        describe('when only stats is undefined', () => {
            beforeAll(async () => {
                const set = await findOrCreateSet();
                const setId = set._id;
                const newSet = { ...validSet, stats: undefined };
                response = await putSetRequest(setId, newSet);
            })

            it('type of response should contain json', () => {
                responseTypeShouldContainJson(response);
            })

            it('response status should be 400', () => {
                responseStatusShouldBe(response, 400);
            })

            it('message should be correct', () => {
                messageShouldBe(response, 'Stats is required.')
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
            ...extraOptions
        });
    }

    describe('when request is request', () => {
        let response;
        beforeAll(async () => {
            const createdSet = await createSet();
            const createdSetId = createdSet._id;
            response = await deleteSetRequest(createdSetId);
        })

        const createSet = async () => {
            const newSet = new Set(validSet);
            const addedSet = await newSet.save();
            return addedSet;
        }

        it('type of response should contain json', () => {
            responseTypeShouldContainJson(response);
        })

        it('response status should be 200', () => {
            responseStatusShouldBe(response, 200);
        })
    })

    describe('wrong request', () => {
        describe('when access token is invalid', () => {
            let response;
            beforeAll(async () => {
                response = await deleteSetRequest(null, {
                    customToken: 'wrong',
                });
            })

            it('type of response should contain json', () => {
                responseTypeShouldContainJson(response);
            })

            it('response status should be 401', () => {
                responseStatusShouldBe(response, 401);
            })

            it('message should be correct', () => {
                messageShouldBe(response, 'Invalid authorization.')
            })
        })

        describe('request with wrong :setId param', () => {
            let response;
            beforeAll(async () => {
                const wrongSetId = '3213213wrongparam123123';
                response = await deleteSetRequest(wrongSetId);
            })

            it('type of response should contain json', () => {
                responseTypeShouldContainJson(response);
            })

            it('response status should be 400', () => {
                responseStatusShouldBe(response, 400);
            })

            it('message should be correct', () => {
                messageShouldBe(response, 'Invalid request data.')
            })
        })
    })
})

describe('/sets/:setId POST', () => {
    const createSetRequest = (newSet, extraOptions) => {
        return makeHttpRequest(app, {
            method: 'POST',
            endpoint: '/sets',
            isIncludeToken: true,
            data: newSet,
            ...extraOptions
        })
    }

    describe('when request is correct', () => {
        let response;
        let createdSetId;
        beforeAll(async () => {
            response = await createSetRequest(validSet);
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
            responseTypeShouldContainJson(response);
        })

        it('response status should be 201', () => {
            responseStatusShouldBe(response, 201);
        })

        it('response body should contain set data', () => {
            responseBodyShouldContainProperty(response, '_id')
            responseBodyShouldContainProperty(response, 'name')
            responseBodyShouldContainProperty(response, 'cards')
            responseBodyShouldContainProperty(response, 'stats')
            responseBodyShouldContainProperty(response, 'creator')
        })

        it('created set should exists in db', async () => {
            const findedSet = await Set.findOne({ _id: createdSetId })
            expect(findedSet).not.toBe(null);
        })
    })

    describe('when request is wrong', () => {
        describe('when access token is invalid', () => {
            let response;
            beforeAll(async () => {
                response = await createSetRequest(null, {
                    customToken: 'wrong',
                });
            })

            it('type of response should contain json', () => {
                responseTypeShouldContainJson(response);
            })

            it('response status should be 401', () => {
                responseStatusShouldBe(response, 401);
            })

            it('message should be correct', () => {
                messageShouldBe(response, 'Invalid authorization.')
            })
        })

        describe('when only name is required', () => {
            let response;
            beforeAll(async () => {
                response = await createSetRequest({ ...validSet, name: undefined });
            })

            it('type of response should contain json', () => {
                responseTypeShouldContainJson(response);
            })

            it('response status should be 400', () => {
                responseStatusShouldBe(response, 400);
            })

            it('message should be correct', () => {
                messageShouldBe(response, 'Name is required.')
            })
        })
        describe('when only cards is undefined', () => {
            let response;
            beforeAll(async () => {
                response = await createSetRequest({ ...validSet, cards: undefined });
            })
            it('type of response should contain json', () => {
                responseTypeShouldContainJson(response);
            })

            it('response status should be 400', () => {
                responseStatusShouldBe(response, 400);
            })

            it('message should be correct', () => {
                messageShouldBe(response, 'Cards is required.')
            })
        })
        describe('when only stats is undefined', () => {
            let response;
            beforeAll(async () => {
                response = await createSetRequest({ ...validSet, stats: undefined });
            })

            it('type of response should contain json', () => {
                responseTypeShouldContainJson(response);
            })

            it('response status should be 400', () => {
                responseStatusShouldBe(response, 400);
            })

            it('message should be correct', () => {
                messageShouldBe(response, 'Stats is required.')
            })
        })

        describe('when name is too short', () => {
            let response;
            beforeAll(async () => {
                response = await createSetRequest({ ...validSet, name: 'n' });
            })

            it('type of response should contain json', () => {
                responseTypeShouldContainJson(response);
            })

            it('response status should be 400', () => {
                responseStatusShouldBe(response, 400);
            })

            it('message should be correct', () => {
                messageShouldBe(response, 'Name is too short.')
            })
        })
    })
})