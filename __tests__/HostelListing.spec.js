/* eslint-disable no-undef */
const request = require("supertest");
const en = require("../locale/en");
const { connectToDatabase, mongoose } = require("../src/database/connection");
const mockData = require("./resources/mock-data");
const app = require("../src/app");
const { Porter, Hostel } = require("../src/database/model");
const porterCredentials = { email: "porter1@mail.com", password: "P4ssword" };

let token;

// eslint-disable-next-line no-undef
beforeEach(async () => {
  await connectToDatabase();
});

// eslint-disable-next-line no-undef
afterEach(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

const addHostel = async (num = 1, hostels = [mockData.hostel]) => {
  for (let index = 1; index < num; index++) {
    hostels.push({...hostels[0],
      name: "Cam David 2 Boys" + index,
    });
  }
  
  const data = await Hostel.create(hostels);
  return data;
};


const addPorter = async (porter = mockData.porter1) => {
  const data = await Porter.create(porter);
  return data;
};

const porterLogin = async (porter = porterCredentials) => {
  await addPorter();
  let agent = await request(app)
    .post("/api/1.0/auth")
    .set("origin", "localhost:7001")
    .send(porter);

  // Extract the access token from the response body
  if (agent.body.tokens) {
    token = agent.body.tokens.accessToken;
  }
  return agent;
};

describe("Get Hostel By Id", () => {
  const getHostel = async (id) => {
    let agent = request(app)
      .get(`/api/1.0/hostel/${id}`)
      .set("origin", "localhost:7001");

    if (token) {
      agent.set("x-access-token", token);
    }

    return await agent.send();
  };

  it("returns - HTTP 401 when we try to get hostel without login", async () => {
    const hostels = await addHostel();

    const response = await getHostel(hostels[0].id);

    expect(response.status).toBe(401);
  });

  it(`returns - ${en.authentication_failure} when we try to get hostel without login`, async () => {
    const hostels = await addHostel();

    const response = await getHostel(hostels[0].id);

    expect(response.body.message).toBe(en.authentication_failure);
  });

  it("returns - HTTP 200 ok when we get hostels with authenticated request", async () => {
    const hostels = await addHostel();
    await porterLogin();
    const response = await getHostel(hostels[0].id);

    expect(response.status).toBe(200);
  });

  it("returns - hostel data when we get hostels with authenticated request", async () => {
    const hostels = await addHostel();
    await porterLogin();
    const response = await getHostel(hostels[0].id);

    expect(response.body.name).toBe(mockData.hostel.name);
  });
});

describe("Get All User with Pagination", () => {
  const getHostels = async () => {
    let agent = request(app)
      .get("/api/1.0/hostel/")
      .set("origin", "localhost:7001");

    if (token) {
      agent.set("x-access-token", token);
    }

    return await agent.send();
  };

  it("returns - HTTP 401 when we try to get hostel without login", async () => {
    await addHostel();

    const response = await getHostels();

    expect(response.status).toBe(401);
  });

  it(`returns - ${en.authentication_failure} when we tru to get hostel without login`, async () => {
    await addHostel();

    const response = await getHostels();

    expect(response.body.message).toBe(en.authentication_failure);
  });

  it("returns - HTTP 200 ok when we get hostels with authenticated request", async () => {
    await addHostel();
    await porterLogin();
    const response = await getHostels();


    expect(response.status).toBe(200);
  });

  it("returns - hostel data when we get hostels with authenticated request", async () => {
    await addHostel(25);
    await porterLogin();
    const response = await getHostels();
    
    expect(response.body.length).toBe(25);
  });
});

describe("Get Users By Filtering", () => {
  const getHostels = async (filter) => {
    let agent = request(app)
      .post("/api/1.0/hostel/filter")
      .set("origin", "localhost:7001");

    if (token) {
      agent.set("x-access-token", token);
    }

    return await agent.send(filter);
  };

  it("return - HTTP 200 ok when we successfuly fetch hostels", async () => {
    await addHostel(1, {...mockData.hostel, maxPerRoom: 5, name: "Block U"});
    await addHostel(1, {...mockData.hostel, maxPerRoom: 5, name: "Block I"});
    await addHostel(1, {...mockData.hostel, maxPerRoom: 5, name: "Exodus"});
    await addHostel(3);
    await porterLogin();

    const response = await getHostels({ maxPerRoom: 5 });

    expect(response.status).toBe(200);
  });

  it("return - hostel data of filter hostels after successful api call", async () => {
    await addHostel(1, {...mockData.hostel, maxPerRoom: 5, name: "Block U"});
    await addHostel(1, {...mockData.hostel, maxPerRoom: 5, name: "Block I"});
    await addHostel(1, {...mockData.hostel, maxPerRoom: 5, name: "Exodus"});
    await addHostel(3);
    await porterLogin();

    const response = await getHostels({ maxPerRoom: 5 });

    expect(response.body.length).toBe(3);
  });

  it("check - ensure hostels match the filter passed into the api call", async () => {
    await addHostel(1, {...mockData.hostel, maxPerRoom: 5, name: "Block U"});
    await addHostel(1, {...mockData.hostel, maxPerRoom: 5, name: "Block I"});
    await addHostel(1, {...mockData.hostel, maxPerRoom: 5, name: "Exodus"});
    await addHostel(3);
    await porterLogin();

    const response = await getHostels({ maxPerRoom: 5 });
    let filterCheck = true;

    for (let i = 0; i < 3; i++) {
      if (response.body[i].maxPerRoom != 5) {
        filterCheck = false;
      }
    }
    expect(filterCheck).toBe(true);
  });
});
