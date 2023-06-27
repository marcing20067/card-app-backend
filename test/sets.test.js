const { setObj, createSet } = require("./helpers/mocks");

jest.mock("jsonwebtoken", () => {
  const { JWT_MOCK_USER_ID } = require("./helpers/mocks");
  return {
    verify: jest.fn().mockReturnValue({ _id: JWT_MOCK_USER_ID }),
  };
});

const app = require("../app");
const { clearChanges, closeConnection } = require("./helpers/db");
const { makeHttpRequest } = require("./helpers/requests");
const { Set } = require("../models/set");

afterEach(clearChanges);
afterAll(closeConnection);

describe("/sets GET", () => {
  const getSetsRequest = (options) => {
    return makeHttpRequest(app, {
      method: "GET",
      endpoint: "/sets",
      ...options,
    });
  };

  it("when request is correct", async () => {
    const response = await getSetsRequest();
    const contentType = response.headers["content-type"];
    const sets = response.body;

    expect(/json/.test(contentType));
    expect(response.status).toBe(200);
    expect(sets.length).toBe(0);
    expect(sets).toEqual(expect.any(Array));
  });

  describe("pagination tests", () => {
    it("when request is correct", async () => {
      await createSet({ name: "name one" });
      const set = await createSet({ name: "name two" });

      const response = await getSetsRequest({
        endpoint: "/sets?page=2&items=1",
      });
      const contentType = response.headers["content-type"];
      const paginationSets = response.body;

      expect(/json/.test(contentType));
      expect(response.status).toBe(200);
      expect(paginationSets.length).toBe(1);
      expect(paginationSets[0].name).toBe(set.name);
    });

    it("when sets on this page doesnt exists", async () => {
      const response = await getSetsRequest({
        endpoint: "/sets?page=30&items=1",
      });
      const contentType = response.headers["content-type"];

      expect(/json/.test(contentType));
      expect(response.status).toBe(200);
      expect(response.body).toStrictEqual([]);
    });
  });
});

describe("/sets/:id GET", () => {
  const getSetRequest = (setId) => {
    return makeHttpRequest(app, {
      method: "GET",
      endpoint: `/sets/${setId}`,
    });
  };

  it("when request is correct", async () => {
    const createdSet = await createSet();
    const response = await getSetRequest(createdSet._id);
    const contentType = response.headers["content-type"];

    expect(/json/.test(contentType));
    expect(response.status).toBe(200);

    expect(response.body).toMatchObject({
      _id: expect.any(String),
      name: expect.any(String),
      cards: expect.any(Object),
      creator: expect.any(String),
      stats: expect.any(Object),
    });
  });

  describe("when request is wrong", () => {
    it("request with wrong set id", async () => {
      const wrongSetId = "testtest123";
      const response = await getSetRequest(wrongSetId);
      const contentType = response.headers["content-type"];
      const message = response.body.message;

      expect(/json/.test(contentType));
      expect(response.status).toBe(400);
      expect(message).toBe("Invalid request data.");
    });

    it("request with wrong set id but ObjectId", async () => {
      const wrongSetId = "1249b4ddd2781d08c09890f3";
      const response = await getSetRequest(wrongSetId);
      const contentType = response.headers["content-type"];
      const message = response.body.message;

      expect(/json/.test(contentType));
      expect(response.status).toBe(400);
      expect(message).toBe("Invalid request data.");
    });
  });
});

describe("/sets/:id PUT", () => {
  const putSetRequest = (oldSetId, newSet, options) => {
    return makeHttpRequest(app, {
      method: "PUT",
      endpoint: `/sets/${oldSetId}`,
      data: newSet,
      ...options,
    });
  };

  it("when request is correct", async () => {
    const createdSet = await createSet();
    const updatedSet = { ...createdSet, name: "edited!" };
    const response = await putSetRequest(createdSet._id, updatedSet);
    const contentType = response.headers["content-type"];

    expect(/json/.test(contentType));
    expect(response.status).toBe(200);
    expect(response.body.name).toEqual("edited!");

    expect(response.body).toMatchObject({
      _id: expect.any(String),
      name: expect.any(String),
      cards: expect.any(Object),
      creator: expect.any(String),
      stats: expect.any(Object),
    });

    const foundSet = await Set.findOne({ name: "edited!", _id: createdSet });
    expect(foundSet).not.toBe(null);
  });

  describe("when request is wrong", () => {
    it("when set id is wrong", async () => {
      const wrongSetId = "wrongSetId";
      const updatedSet = { ...setObj, name: "edited!" };
      const response = await putSetRequest(wrongSetId, updatedSet);
      const contentType = response.headers["content-type"];
      const message = response.body.message;

      expect(/json/.test(contentType));
      expect(response.status).toBe(400);
      expect(message).toBe("Invalid request data.");
    });

    it("when new set is undefined", async () => {
      const createdSet = await createSet();
      const newSet = undefined;
      const response = await putSetRequest(createdSet._id, newSet);
      const contentType = response.headers["content-type"];
      const message = response.body.message;

      expect(/json/.test(contentType));
      expect(response.status).toBe(400);
      expect(message).toBe("Invalid request data.");
    });

    it("when only name is undefined", async () => {
      const createdSet = await createSet();
      const updatedSet = { ...createdSet, name: undefined };
      const response = await putSetRequest(createdSet._id, updatedSet);
      const contentType = response.headers["content-type"];
      const message = response.body.message;

      expect(/json/.test(contentType));
      expect(response.status).toBe(400);
      expect(message).toBe("Name is required.");
    });

    it("when only cards is undefined", async () => {
      const createdSet = await createSet();
      const newSet = { ...setObj, cards: undefined };
      const response = await putSetRequest(createdSet._id, newSet);
      const contentType = response.headers["content-type"];
      const message = response.body.message;

      expect(/json/.test(contentType));
      expect(response.status).toBe(400);
      expect(message).toBe("Cards is required.");
    });

    it("when only stats is undefined", async () => {
      const createdSet = await createSet();
      const newSet = { ...createdSet, stats: undefined };
      const response = await putSetRequest(createdSet._id, newSet);
      const contentType = response.headers["content-type"];
      const message = response.body.message;

      expect(/json/.test(contentType));
      expect(response.status).toBe(400);
      expect(message).toBe("Stats is required.");
    });

    it("when set name is taken", async () => {
      const set = await createSet();
      const set2 = await createSet({ name: set.name + "two" });
      
      const newSet = { ...set, name: set2.name };
      const response = await putSetRequest(set._id, newSet);
      const contentType = response.headers["content-type"];
      const message = response.body.message;

      expect(/json/.test(contentType));
      expect(response.status).toBe(409);
      expect(message).toBe("Name is already taken.");
    });
  });
});

describe("/sets/:createdSet DELETE", () => {
  const deleteSetRequest = (setId, options) => {
    return makeHttpRequest(app, {
      method: "DELETE",
      endpoint: `/sets/${setId}`,
      ...options,
    });
  };

  it("when request is correct", async () => {
    const createdSet = await createSet();
    const response = await deleteSetRequest(createdSet._id);
    const contentType = response.headers["content-type"];

    expect(/json/.test(contentType));
    expect(response.status).toBe(200);
  });

  it("request with wrong :createdSet param", async () => {
    const wrongSetId = "wrongSetId12345";
    const response = await deleteSetRequest(wrongSetId);
    const contentType = response.headers["content-type"];
    const message = response.body.message;

    expect(/json/.test(contentType));
    expect(response.status).toBe(400);
    expect(message).toBe("Invalid request data.");
  });
});

describe("/sets POST", () => {
  const postSetRequest = (newSet, extraOptions) => {
    return makeHttpRequest(app, {
      method: "POST",
      endpoint: "/sets",
      data: newSet,
      ...extraOptions,
    });
  };

  it("when request is correct", async () => {
    const response = await postSetRequest(setObj);
    const createdSetId = response.body._id;
    const contentType = response.headers["content-type"];

    expect(/json/.test(contentType));
    expect(response.status).toBe(201);

    expect(response.body).toMatchObject({
      _id: expect.any(String),
      name: expect.any(String),
      cards: expect.any(Object),
      stats: expect.any(Object),
      creator: expect.any(String),
    });

    const foundSet = await Set.findOne({ _id: createdSetId });
    expect(foundSet).not.toBe(null);
  });

  describe("when request is wrong", () => {
    it("when definition is duplicated", async () => {
      const response = await postSetRequest({
        ...setObj,
        cards: [
          {
            definition: "definition",
            concept: "duplicate",
            group: 1,
          },
          {
            definition: "definition",
            concept: "duplicate",
            group: 1,
          },
          {
            definition: "definition",
            concept: "noduplicate",
            group: 1,
          },
        ],
      });

      const contentType = response.headers["content-type"];
      const message = response.body.message;

      expect(/json/.test(contentType));
      expect(response.status).toBe(400);
      expect(message).toBe('Concept "duplicate" is duplicated.');
    });
  });

  it("when only name is required", async () => {
    const response = await postSetRequest({ ...setObj, name: undefined });
    const contentType = response.headers["content-type"];
    const message = response.body.message;

    expect(/json/.test(contentType));
    expect(response.status).toBe(400);
    expect(message).toBe("Name is required.");
  });

  it("when only stats is undefined", async () => {
    const response = await postSetRequest({ ...setObj, stats: undefined });
    const contentType = response.headers["content-type"];
    const message = response.body.message;

    expect(/json/.test(contentType));
    expect(response.status).toBe(400);
    expect(message).toBe("Stats is required.");
  });

  it("when name is too short", async () => {
    const response = await postSetRequest({ ...setObj, name: "n" });
    const contentType = response.headers["content-type"];
    const message = response.body.message;

    expect(/json/.test(contentType));
    expect(response.status).toBe(400);
    expect(message).toBe("Name is too short.");
  });

  it("when sets is already taken", async () => {
    const createdSet = await createSet();
    const response = await postSetRequest(createdSet);
    const contentType = response.headers["content-type"];
    const message = response.body.message;

    expect(/json/.test(contentType));
    expect(response.status).toBe(409);
    expect(message).toBe("Name is already taken.");
  });
});
