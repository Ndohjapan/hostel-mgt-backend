/* eslint-disable no-undef */
const request = require("supertest");
const app = require("../src/app");
const { connectToDatabase, mongoose } = require("../src/database/connection");
const { Hostel, Porter, Room } = require("../src/database/model");
const mockData = require("./resources/mock-data");
const porterCredentials = { email: "porter1@mail.com", password: "P4ssword" };

let token;

beforeEach(async () => {
  await connectToDatabase();

});

afterEach(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();

});


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
  if(agent.body.tokens){
    token = agent.body.tokens.accessToken;
  }
  return agent;
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
  

describe("Create Room", () => {
  const createRoom = async (hostel, from = 101, to = 114, maxPerRoom = 4) => {
    let agent = request(app)
      .post("/api/1.0/room/")
      .set("origin", "localhost:7001");

    if (token) {
      agent.set("x-access-token", token);
    }

    return await agent.send({hostel, from, to, maxPerRoom});
  };

  it("return - HTTP 200 ok when the rooms are created successfully", async () => {
    const hostels = await addHostel();
    await porterLogin();

    const response = await createRoom(hostels[0].id);

    expect(response.status).toBe(200);
  });


  it("checks - database to ensure room document was saved", async() => {
    const hostels = await addHostel();
    await porterLogin();

    await createRoom(hostels[0].id);

    const roomDb = await Room.find({});

    expect(roomDb.length).toBe(14);
  });

  it("return - HTTP 200 ok when we create just one room", async () => {
    const hostels = await addHostel();
    await porterLogin();

    const response = await createRoom(hostels[0].id, 104, 104);

    expect(response.status).toBe(200);
  });


  it("checks - database to ensure one room document was saved", async() => {
    const hostels = await addHostel();
    await porterLogin();

    await createRoom(hostels[0].id, 104, 104);

    const roomDb = await Room.find({});

    expect(roomDb.length).toBe(1);
  });

  /**
   * Test to maintain unique room number in each hostel
   */

  //   it("return - HTTP 400 when we try to create 2 rooms of the same hostel with same room number", async() => {
  //     const hostels = await addHostel();
  //     await porterLogin();

  //     await createRoom(hostels[0].id, 104, 104);
  //     const response = await createRoom(hostels[0].id, 104, 104);

  //     expect(response.status).toBe(400);
  //   });

  
  //   it(`return - '${en.room_duplicate_error}' when we try to create 2 rooms of the same hostel`, async() => {
  //     const hostels = await addHostel();
  //     await porterLogin();
    
  //     await createRoom(hostels[0].id, 104, 104);
  //     const response = await createRoom(hostels[0].id, 104, 104);
    
  //     expect(response.body.message).toBe(en.room_duplicate_error);
  //   });

  it("check - ensure the room range of the hostel is updated", async() => {
    const hostels = await addHostel();
    await porterLogin();

    await createRoom(hostels[0].id);
    await createRoom(hostels[0].id, 201, 225);

    const hostelDb = await Hostel.find({});

    expect(hostelDb[0].totalRooms).toBe(39);
    expect(hostelDb[0].roomRange).toEqual(["101 - 114", "201 - 225"]);
  });

});
