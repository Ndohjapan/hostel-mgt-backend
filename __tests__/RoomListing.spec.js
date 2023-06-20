/* eslint-disable no-undef */
const request = require("supertest");
const en = require("../locale/en");
const { connectToDatabase, mongoose } = require("../src/database/connection");
const mockData = require("./resources/mock-data");
const app = require("../src/app");
const { Porter, Hostel, Room } = require("../src/database/model");
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

const addRoom = async (hostel, from = 101, to = 114, maxPerRoom = 4) => {
  const room = [];
  for(let i=from; i<=to; i++){
    room.push({
      hostel: hostel,
      maxPerRoom: maxPerRoom,
      roomNum: i,
    });
  }
  const rooms = await Room.create(room);
  return rooms;
};

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

describe("Get Room By Id", () => {
  const getRoom = async (id) => {
    let agent = request(app)
      .get(`/api/1.0/room/${id}`)
      .set("origin", "localhost:7001");

    if (token) {
      agent.set("x-access-token", token);
    }

    return await agent.send();
  };

  it("returns - HTTP 401 when we try to get room without login", async () => {
    const hostels = await addHostel();

    const rooms = await addRoom(hostels[0].id);

    const response = await getRoom(rooms[0].id);

    expect(response.status).toBe(401);
  });

  it(`returns - ${en.authentication_failure} when we try to get room without login`, async () => {
    const hostels = await addHostel();

    const rooms = await addRoom(hostels[0].id);

    const response = await getRoom(rooms[0].id);

    expect(response.body.message).toBe(en.authentication_failure);
  });

  it("returns - HTTP 200 ok when we get rooms with authenticated request", async () => {
    const hostels = await addHostel();

    const rooms = await addRoom(hostels[0].id);

    await porterLogin();
    const response = await getRoom(rooms[0].id);

    expect(response.status).toBe(200);
  });

  it("returns - room data when we get rooms with authenticated request", async () => {
    const hostels = await addHostel();

    const rooms = await addRoom(hostels[0].id);

    await porterLogin();
    const response = await getRoom(rooms[0].id);

    expect(response.body.hostel).toBe(hostels[0].id);
  });
});

describe("Get All Rooms with Pagination", () => {
  const getRooms = async (page = 1, limit = 10) => {
    let agent = request(app)
      .get("/api/1.0/room/")
      .query({ page, limit })
      .set("origin", "localhost:7001");

    if (token) {
      agent.set("x-access-token", token);
    }

    return await agent.send();
  };

  it("returns - HTTP 401 when we try to get rooms without login", async () => {
    const hostels = await addHostel();

    await addRoom(hostels[0].id);

    const response = await getRooms();

    expect(response.status).toBe(401);
  });

  it(`returns - ${en.authentication_failure} when we tru to get rooms without login`, async () => {
    const hostels = await addHostel();

    await addRoom(hostels[0].id);

    const response = await getRooms();

    expect(response.body.message).toBe(en.authentication_failure);
  });

  it("returns - HTTP 200 ok when we get rooms with authenticated request", async () => {
    const hostels = await addHostel();

    await addRoom(hostels[0].id);
    await porterLogin();

    const response = await getRooms();

    expect(response.status).toBe(200);
  });

  it("returns - room data when we get hostels with authenticated request", async () => {
    const hostels = await addHostel();

    await addRoom(hostels[0].id);
    await porterLogin();

    const response = await getRooms();
    

    expect(response.body.limit).toBe(10);
    expect(response.body.totalDocs).toBe(14);
  });
});

describe("Get Rooms By Filtering", () => {
  const getRooms = async (filter, page = 1, limit = 10) => {
    let agent = request(app)
      .post("/api/1.0/room/filter")
      .query({ page, limit })
      .set("origin", "localhost:7001");

    if (token) {
      agent.set("x-access-token", token);
    }

    return await agent.send(filter);
  };

  it("return - HTTP 200 ok when we successfuly fetch rooms", async () => {
    const hostels = await addHostel(2);

    await addRoom(hostels[1].id, 211, 230);
    await addRoom(hostels[0].id);

    await porterLogin();

    const response = await getRooms({hostel: hostels[1].id});

    expect(response.status).toBe(200);
  });

  it("return - room data of filter rooms after successful api call", async () => {
    const hostels = await addHostel(2);

    await addRoom(hostels[1].id, 211, 230);
    await addRoom(hostels[0].id);

    await porterLogin();

    const response = await getRooms({hostel: hostels[1].id});

    expect(response.body.totalDocs).toBe(20);
    expect(response.body.limit).toBe(10);
  });

  it("check - ensure rooms match the filter passed into the api call", async () => {
    const hostels = await addHostel(2);

    await addRoom(hostels[1].id, 211, 230);
    await addRoom(hostels[0].id);

    await porterLogin();

    const response = await getRooms({hostel: hostels[1].id}, 1, 20);
    let filterCheck = true;

    console.log(response.body.docs.length);

    for (let i = 0; i < 20; i++) {
      if (response.body.docs[i].hostel._id != hostels[1].id) {
        filterCheck = false;
      }
    }
    expect(filterCheck).toBe(true);
  });
});
