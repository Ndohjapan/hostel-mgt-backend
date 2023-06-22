/* eslint-disable no-undef */
const request = require("supertest");
const app = require("../src/app");
const {
  connectToDatabase,
  mongoose
} = require("../src/database/connection");
const { addUser, addHostel, addRoom, porterLogin } = require("./resources/frequently-used-functions");

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

const assignStudent = async (roomId, userId) => {
  let agent = request(app).post("/api/1.0/user/assign").set("origin", "localhost:7001");

  if(token){
    agent.set("x-access-token", token);
  }

  return await agent.send({roomId, userId});
};

describe("List Rooms that are availaeble", () => {
  const getAvailableRooms = async (hostelId) => {
    let agent = request(app).get(`/api/1.0/room/available/${hostelId}`).set("origin", "localhost:7001");
      
    if(token){
      agent.set("x-access-token", token);
    }
      
    return await agent.send();
  };

  it("return - HTTP 200 when the request is successful", async() => {
    token = await porterLogin();
    const users = await addUser(8);
    const hostels = await addHostel();
    const rooms = await addRoom(hostels[0].id);

    await assignStudent(rooms[0].id, users[0].id);
    await assignStudent(rooms[0].id, users[1].id);
    await assignStudent(rooms[0].id, users[2].id);
    await assignStudent(rooms[0].id, users[3].id);
    await assignStudent(rooms[1].id, users[4].id);
    await assignStudent(rooms[1].id, users[5].id);
    await assignStudent(rooms[2].id, users[6].id);
    await assignStudent(rooms[2].id, users[7].id);

    const response = await getAvailableRooms(hostels[0].id);

    expect(response.status).toBe(200);
  });

  it("check - ensure that all the rooms returned have a vacant space", async() => {
    token = await porterLogin();
    const users = await addUser(8);
    const hostels = await addHostel();
    const rooms = await addRoom(hostels[0].id);

    await assignStudent(rooms[0].id, users[0].id);
    await assignStudent(rooms[0].id, users[1].id);
    await assignStudent(rooms[0].id, users[2].id);
    await assignStudent(rooms[0].id, users[3].id);
    await assignStudent(rooms[1].id, users[4].id);
    await assignStudent(rooms[1].id, users[5].id);
    await assignStudent(rooms[2].id, users[6].id);
    await assignStudent(rooms[2].id, users[7].id);

    const response = await getAvailableRooms(hostels[0].id);

    let filterCheck = true;

    for(room of response.body){
      if(room.numOfStudents >= room.maxPerRoom || room.hostel != hostels[0].id){
        filterCheck = false;
        break;
      }
    }

    expect(response.body.length).toBe(13);
    expect(filterCheck).toBeTruthy();

  });

  it("check - ensure that all the rooms returned have a vacant space and a room number", async() => {
    token = await porterLogin();
    const users = await addUser(8);
    const hostels = await addHostel();
    const rooms = await addRoom(hostels[0].id);

    await assignStudent(rooms[0].id, users[0].id);
    await assignStudent(rooms[0].id, users[1].id);
    await assignStudent(rooms[0].id, users[2].id);
    await assignStudent(rooms[0].id, users[3].id);
    await assignStudent(rooms[1].id, users[4].id);
    await assignStudent(rooms[1].id, users[5].id);
    await assignStudent(rooms[2].id, users[6].id);
    await assignStudent(rooms[2].id, users[7].id);

    const response = await getAvailableRooms(hostels[0].id);

    let filterCheck = true;

    for(room of response.body){
      if(!room.roomNum){
        filterCheck = false;
        break;
      }
    }

    expect(response.body.length).toBe(13);
    expect(filterCheck).toBeTruthy();

  });
});