/* eslint-disable no-undef */
const request = require("supertest");
const app = require("../src/app");
const {
  connectToDatabase,
  mongoose
} = require("../src/database/connection");
const mockData = require("./resources/mock-data");
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

describe("Update One Room", () => {
  const updateRoom = async (id, updateData) => {
    let agent = request(app)
      .patch(`/api/1.0/room/${id}`)
      .set("origin", "localhost:7001");

    if (token) {
      agent.set("x-access-token", token);
    }

    return await agent.send(updateData);
  };

  it("return - HTTP 200 ok when update is successful", async() => {
    const hostels = await addHostel();

    const rooms = await addRoom(hostels[0].id);

    await porterLogin();

    const response = await updateRoom(rooms[0].id, {maxPerRoom: 5});

    expect(response.status).toBe(200);
  });

  it("return - updated room data when update is successful", async() => {
    const hostels = await addHostel();

    const rooms = await addRoom(hostels[0].id);

    await porterLogin();

    const response = await updateRoom(rooms[0].id, {maxPerRoom: 5});

    expect(response.body.maxPerRoom).toBe(5);

  });

  it("check - ensure room is updated in database when update is successful", async() => {
    const hostels = await addHostel();

    const rooms = await addRoom(hostels[0].id);

    await porterLogin();

    await updateRoom(rooms[0].id, {maxPerRoom: 5});

    const updatedRooms = await Room.findById(rooms[0].id);

    expect(updatedRooms.maxPerRoom).toBe(5);
  });

  it("check - ensure empty fields cannot be updated", async() => {
    const hostels = await addHostel();

    const rooms = await addRoom(hostels[0].id);

    await porterLogin();

    await updateRoom(rooms[0].id, {maxPerRoom: 5, hostel: ""});

    const updatedRooms = await Room.findById(rooms[0].id);

    expect(updatedRooms.maxPerRoom).toBe(5);
    expect(updatedRooms.hostel.toString()).toBe(hostels[0].id);


  });

  it("check - ensure porter can only update the 'maxPerRoom' field and nothing else", async() => {
    const hostels = await addHostel();

    const rooms = await addRoom(hostels[0].id);

    await porterLogin();

    await updateRoom(rooms[0].id, {maxPerRoom: 5, students: [hostels[0].id], roomNum: 113});

    const updatedRooms = await Room.findById(rooms[0].id);

    expect(updatedRooms.maxPerRoom).toBe(5);
    expect(updatedRooms.students.length).toBe(0);
    expect(updatedRooms.roomNum).toBe(rooms[0].roomNum);
  });
});

