/* eslint-disable no-undef */
const request = require("supertest");
const app = require("../src/app");
const {
  connectToDatabase,
  mongoose
} = require("../src/database/connection");
const { Room, User } = require("../src/database/model");
const { addUser, addHostel, addRoom, porterLogin } = require("./resources/frequently-used-functions");
const en = require("../locale/en");

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

describe("Assign User To Room", () => {

  it("return - HTTP 200 ok once the assignment is done successfully", async() => {
    token = await porterLogin();
    const users = await addUser();
    const hostels = await addHostel();
    const rooms = await addRoom(hostels[0].id);

    const response = await assignStudent(rooms[0].id, users[0].id);

    expect(response.status).toBe(200);

  });

  it("return - user data once the assignment is complete", async() => {
    token = await porterLogin();
    const users = await addUser();
    const hostels = await addHostel();
    const rooms = await addRoom(hostels[0].id);

    const response = await assignStudent(rooms[0].id, users[0].id);

    expect(response.body.firstname).toBe(users[0].firstname);
  });

  it("check - ensure the room was assigned to the user", async() => {
    token = await porterLogin();
    const users = await addUser();
    const hostels = await addHostel();
    const rooms = await addRoom(hostels[0].id);

    await assignStudent(rooms[0].id, users[0].id);

    const userDb = await User.findById(users[0].id);

    expect(userDb.room._id.toString()).toBe(rooms[0].id);
  });

  it("check - ensure the user was appended into the room array", async() => {
    token = await porterLogin();
    const users = await addUser();
    const hostels = await addHostel();
    const rooms = await addRoom(hostels[0].id);

    await assignStudent(rooms[0].id, users[0].id);

    const roomDb = await Room.findById(rooms[0].id);

    expect(roomDb.students.includes(users[0].id)).toBeTruthy();
  });

  it("check - ensure the number of students in the room increased after assinging the user to the room", async() => {
    token = await porterLogin();
    const users = await addUser();
    const hostels = await addHostel();
    const rooms = await addRoom(hostels[0].id);

    await assignStudent(rooms[0].id, users[0].id);

    const roomDb = await Room.findById(rooms[0].id);

    expect(roomDb.numOfStudents).toBe(1);
  });
  
  it("check - ensure a user cannot be assigned to a room more than once", async() => {
    token = await porterLogin();
    const users = await addUser();
    const hostels = await addHostel();
    const rooms = await addRoom(hostels[0].id);

    await assignStudent(rooms[0].id, users[0].id);
    await assignStudent(rooms[0].id, users[0].id);

    const roomDb = await Room.findById(rooms[0].id);

    expect(roomDb.numOfStudents).toBe(1);
  });
  
  it("check - ensure the number of users in a room is increased when we assign another user", async() => {
    token = await porterLogin();
    const users = await addUser(2);
    const hostels = await addHostel();
    const rooms = await addRoom(hostels[0].id);

    await assignStudent(rooms[0].id, users[0].id);
    await assignStudent(rooms[0].id, users[1].id);

    const roomDb = await Room.findById(rooms[0].id);

    expect(roomDb.numOfStudents).toBe(2);
  });
  
  it("check - ensure the array holding the user ids also increase when we assign another user", async() => {
    token = await porterLogin();
    const users = await addUser(2);
    const hostels = await addHostel();
    const rooms = await addRoom(hostels[0].id);

    await assignStudent(rooms[0].id, users[0].id);
    await assignStudent(rooms[0].id, users[1].id);

    const roomDb = await Room.findById(rooms[0].id);


    expect(roomDb.students.length).toBe(2);
    expect(roomDb.students.includes(users[0].id)).toBeTruthy();
    expect(roomDb.students.includes(users[1].id)).toBeTruthy();

  });
  
  it("return - HTTP 400 when we try to assign more the required students to a room", async() => {
    token = await porterLogin();
    const users = await addUser(6);
    const hostels = await addHostel();
    const rooms = await addRoom(hostels[0].id);

    await assignStudent(rooms[0].id, users[0].id);
    await assignStudent(rooms[0].id, users[1].id);
    await assignStudent(rooms[0].id, users[2].id);
    await assignStudent(rooms[0].id, users[3].id);
    await assignStudent(rooms[0].id, users[5].id);
    const response = await assignStudent(rooms[0].id, users[4].id);

    expect(response.status).toBe(400);

  });

    
  it(`return - ${en.room_is_full} when we try to assign more the required students to a room`, async() => {
    token = await porterLogin();
    const users = await addUser(6);
    const hostels = await addHostel();
    const rooms = await addRoom(hostels[0].id);

    await assignStudent(rooms[0].id, users[0].id);
    await assignStudent(rooms[0].id, users[1].id);
    await assignStudent(rooms[0].id, users[2].id);
    await assignStudent(rooms[0].id, users[3].id);
    await assignStudent(rooms[0].id, users[5].id);
    const response = await assignStudent(rooms[0].id, users[4].id);

    expect(response.body.message).toBe(en.room_is_full + rooms[0].maxPerRoom);

  });

  it("return - HTTP 400 when I try to assign a user to a another while he is still in another room", async() => {
    token = await porterLogin();
    const users = await addUser();
    const hostels = await addHostel();
    const rooms = await addRoom(hostels[0].id);

    await assignStudent(rooms[0].id, users[0].id);
    const response = await assignStudent(rooms[1].id, users[0].id);

    expect(response.status).toBe(400);

  });

  it(`return - '${en.user_room_duplicate_error}' when I try to assign a user to a another while he is still in another room`, async() => {
    token = await porterLogin();
    const users = await addUser();
    const hostels = await addHostel();
    const rooms = await addRoom(hostels[0].id);

    await assignStudent(rooms[0].id, users[0].id);
    const response = await assignStudent(rooms[1].id, users[0].id);

    expect(response.body.message).toBe(en.user_room_duplicate_error);

  });

  it("check - ensure the user is not appended to the second room when he is already in another room", async() => {
    token = await porterLogin();
    const users = await addUser();
    const hostels = await addHostel();
    const rooms = await addRoom(hostels[0].id);

    await assignStudent(rooms[0].id, users[0].id);
    await assignStudent(rooms[1].id, users[0].id);

    const roomdb = await Room.find({ $or: [{ _id: rooms[0].id }, { _id: rooms[1].id }] });

    expect(roomdb[0].students.length).toBe(1);
    expect(roomdb[1].students.length).toBe(0);

  });
});

describe("Remove User From Room", () => {
  const removeStudent = async (userId) => {
    let agent = request(app).post("/api/1.0/user/remove").set("origin", "localhost:7001");
    
    if(token){
      agent.set("x-access-token", token);
    }
    
    return await agent.send({userId});
  };

  it("return - HTTP 200 ok once the removal is done successfully", async() => {
    token = await porterLogin();
    const users = await addUser();
    const hostels = await addHostel();
    const rooms = await addRoom(hostels[0].id);

    await assignStudent(rooms[0].id, users[0].id);

    const response = await removeStudent(users[0].id);

    expect(response.status).toBe(200);

  });

  it("return - user data once the removal is complete", async() => {
    token = await porterLogin();
    const users = await addUser();
    const hostels = await addHostel();
    const rooms = await addRoom(hostels[0].id);

    await assignStudent(rooms[0].id, users[0].id);

    const response = await removeStudent(users[0].id);

    expect(response.body.firstname).toBe(users[0].firstname);
  });

  it("check - ensure the room id was removed from the user document", async() => {
    token = await porterLogin();
    const users = await addUser();
    const hostels = await addHostel();
    const rooms = await addRoom(hostels[0].id);

    await assignStudent(rooms[0].id, users[0].id);

    await removeStudent(users[0].id);

    const userDb = await User.findById(users[0].id);

    expect(userDb.room).toBe(null);
  });

  it("check - ensure the user was removed from the room array", async() => {
    token = await porterLogin();
    const users = await addUser();
    const hostels = await addHostel();
    const rooms = await addRoom(hostels[0].id);

    await assignStudent(rooms[0].id, users[0].id);

    await removeStudent(users[0].id);

    const roomDb = await Room.findById(rooms[0].id);

    expect(roomDb.students.includes(users[0].id)).toBeFalsy();
  });

  it("check - ensure the number of students in the room reduced after removing the user from the room", async() => {
    token = await porterLogin();
    const users = await addUser();
    const hostels = await addHostel();
    const rooms = await addRoom(hostels[0].id);

    await assignStudent(rooms[0].id, users[0].id);

    await removeStudent(users[0].id);

    const roomDb = await Room.findById(rooms[0].id);

    expect(roomDb.numOfStudents).toBe(0);
  });

  it("check - ensure the number of users in a room is reduced when we remove another user", async() => {
    token = await porterLogin();
    const users = await addUser(2);
    const hostels = await addHostel();
    const rooms = await addRoom(hostels[0].id);

    await assignStudent(rooms[0].id, users[0].id);
    await assignStudent(rooms[0].id, users[1].id);

    await removeStudent(users[0].id);
    await removeStudent(users[1].id);

    const roomDb = await Room.findById(rooms[0].id);

    expect(roomDb.numOfStudents).toBe(0);
  });

  it("check - ensure the array holding the user ids also decrease when we remove one of the users", async() => {
    token = await porterLogin();
    const users = await addUser(2);
    const hostels = await addHostel();
    const rooms = await addRoom(hostels[0].id);

    await assignStudent(rooms[0].id, users[0].id);
    await assignStudent(rooms[0].id, users[1].id);

    await removeStudent(users[0].id);

    const roomDb = await Room.findById(rooms[0].id);


    expect(roomDb.students.length).toBe(1);
    expect(roomDb.students.includes(users[0].id)).toBeFalsy();
    expect(roomDb.students.includes(users[1].id)).toBeTruthy();

  });
});