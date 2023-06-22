/* eslint-disable no-undef */
const request = require("supertest");
const en = require("../locale/en");
const { connectToDatabase, mongoose } = require("../src/database/connection");
const app = require("../src/app");
const { assignStudentToRoom, addUser, porterLogin, addRoom, addHostel } = require("./resources/frequently-used-functions");

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

    token = await porterLogin();
    const response = await getRoom(rooms[0].id);

    expect(response.status).toBe(200);
  });

  it("returns - room data when we get rooms with authenticated request", async () => {
    const hostels = await addHostel();

    const rooms = await addRoom(hostels[0].id);

    token = await porterLogin();
    const response = await getRoom(rooms[0].id);

    expect(response.body.hostel).toBe(hostels[0].id);
  });

  it("check - populate the students field if their are students already in the room", async() => {
    const users = await addUser();
    const hostels = await addHostel();

    const rooms = await addRoom(hostels[0].id);

    token = await porterLogin();

    await assignStudentToRoom(rooms[0].id, users[0].id);

    const response = await getRoom(rooms[0].id);

    expect(response.body.students[0]._id).toBe(users[0].id);
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
    token = await porterLogin();

    const response = await getRooms();

    expect(response.status).toBe(200);
  });

  it("returns - room data when we get hostels with authenticated request", async () => {
    const hostels = await addHostel();

    await addRoom(hostels[0].id);
    token = await porterLogin();

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

    token = await porterLogin();

    const response = await getRooms({hostel: hostels[1].id});

    expect(response.status).toBe(200);
  });

  it("return - room data of filter rooms after successful api call", async () => {
    const hostels = await addHostel(2);

    await addRoom(hostels[1].id, 211, 230);
    await addRoom(hostels[0].id);

    token = await porterLogin();

    const response = await getRooms({hostel: hostels[1].id});

    expect(response.body.totalDocs).toBe(20);
    expect(response.body.limit).toBe(10);
  });

  it("check - ensure rooms match the filter passed into the api call", async () => {
    const hostels = await addHostel(2);

    await addRoom(hostels[1].id, 211, 230);
    await addRoom(hostels[0].id);

    token = await porterLogin();

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
