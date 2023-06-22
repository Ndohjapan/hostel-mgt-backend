/* eslint-disable no-undef */
const request = require("supertest");
const en = require("../locale/en");
const { connectToDatabase, mongoose } = require("../src/database/connection");
const mockData = require("./resources/mock-data");
const app = require("../src/app");
const { Porter, User, Room, Hostel } = require("../src/database/model");
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

const addUser = async (num = 1, user = mockData.user1) => {
  const percentage = (user.hostel.amountPaid / user.hostel.amount) * 100;
  const users = [
    {
      userId: user.userId._id,
      firstname: user.userId.firstname,
      lastname: user.userId.lastname,
      middlename: user.userId.middlename,
      avatar: user.userId.avatar,
      faculty: user.userId.faculty,
      department: user.userId.department,
      level: user.userId.level,
      amountPaid: user.hostel.amountPaid,
      totalAmount: user.hostel.amount,
      percentage,
      matricNumber: user.userId.matricNumber,
    },
  ];

  if(user.room){
    users[0].room = user.room;
  }

  for (let index = 1; index < num; index++) {
    let userId = user.userId._id.slice(0, -2) + "0"+ index;
    if (index > 9) {
      userId = user.userId._id.slice(0, -2) + index;
    }
    users.push({
      ...users[0],
      userId,
      firstname: "Ndoh" + index,
      matricNumber: "LCU/UG/20/100" + index,
      lastname: "Ndoh" + index,
      middlename: "Chibueze" + index,
      amountPaid: 90000 + index,
      percentage: ((90000 + index) / 200000) * 100,
    });
  }

  const data = await User.create(users);
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

describe("Get User By Id", () => {
  const getUser = async (id) => {
    let agent = request(app)
      .get(`/api/1.0/user/${id}`)
      .set("origin", "localhost:7001");

    if (token) {
      agent.set("x-access-token", token);
    }

    return await agent.send();
  };

  it("returns - HTTP 401 when we try to get user without login", async () => {
    const users = await addUser();

    const response = await getUser(users[0].id);

    expect(response.status).toBe(401);
  });

  it(`returns - ${en.authentication_failure} when we try to get user without login`, async () => {
    const user = await addUser();

    const response = await getUser(user.id);

    expect(response.body.message).toBe(en.authentication_failure);
  });

  it("returns - HTTP 200 ok when we get users with authenticated request", async () => {
    const users = await addUser();
    await porterLogin();
    const response = await getUser(users[0].id);

    expect(response.status).toBe(200);
  });

  it("returns - user data when we get users with authenticated request", async () => {
    const users = await addUser();
    await porterLogin();
    const response = await getUser(users[0].id);

    expect(response.body.firstname).toBe(mockData.user1.userId.firstname);
  });

  it("returns - user data which includes a populated rooms fields and inner hostel field", async() => {
    const hostels = await addHostel();
    const rooms = await addRoom(hostels[0].id);
    const users = await addUser(1, {...mockData.user1, room: rooms[0].id});
    await porterLogin();
    const response = await getUser(users[0].id);

    expect(response.body.room.roomNum).toBe(rooms[0].roomNum);

    expect(response.body.room.hostel.name).toBe(hostels[0].name);
  });

  it("check - ensure that the userid refrence from school portal is not returned", async() => {
    const users = await addUser();
    await porterLogin();
    const response = await getUser(users[0].id);

    expect(response.body.userId).toBeFalsy();
  });

  it("check - ensure that the room value is set to null when the user is yet to be assigned a room", async() => {
    const users = await addUser();
    await porterLogin();
    const response = await getUser(users[0].id);

    expect(response.body.room).toBeFalsy();
  });
});

describe("Get All User with Pagination", () => {
  const getUsers = async (page = 1, limit = 10) => {
    let agent = request(app)
      .get("/api/1.0/user/")
      .query({ page, limit })
      .set("origin", "localhost:7001");

    if (token) {
      agent.set("x-access-token", token);
    }

    return await agent.send();
  };

  it("returns - HTTP 401 when we try to get user without login", async () => {
    await addUser();

    const response = await getUsers();

    expect(response.status).toBe(401);
  });

  it(`returns - ${en.authentication_failure} when we tru to get user without login`, async () => {
    await addUser();

    const response = await getUsers();

    expect(response.body.message).toBe(en.authentication_failure);
  });

  it("returns - HTTP 200 ok when we get users with authenticated request", async () => {
    await addUser();
    await porterLogin();
    const response = await getUsers();

    expect(response.status).toBe(200);
  });

  it("returns - user data when we get users with authenticated request", async () => {
    await addUser(25);
    await porterLogin();
    const response = await getUsers();

    expect(response.body.limit).toBe(10);
    expect(response.body.totalDocs).toBe(25);
  });

  it("returns - user data which includes a populated rooms fields and inner hostel field", async () => {
    const hostels = await addHostel();
    const rooms = await addRoom(hostels[0].id);
    await addUser(1, {
      ...mockData.user1,
      userId: {
        ...mockData.user1.userId,
        matricNumber: "LCU/UG/21/18000",
        firstname: "John",
        lastname: "Doe",
        _id: "648f67cec5b0acf0bfe9f700",
        department: "Law",
      },
      room: rooms[0].id
    });
    await addUser(1, {
      ...mockData.user1,
      userId: {
        ...mockData.user1.userId,
        matricNumber: "LCU/UG/21/18001",
        firstname: "John1",
        lastname: "Doe1",
        _id: "648f67cec5b0acf0bfe9f701",
        department: "Law",
      },
      room: rooms[1].id
    });
    await addUser(1, {
      ...mockData.user1,
      userId: {
        ...mockData.user1.userId,
        matricNumber: "LCU/UG/21/18002",
        firstname: "John2",
        lastname: "Doe2",
        _id: "648f67cec5b0acf0bfe9f702",
        department: "Law",
      },
      room: rooms[2].id
    });
    
    await porterLogin();
    const response = await getUsers();

    expect(response.body.docs[0].room.hostel.name).toBe(hostels[0].name);
    expect(response.body.totalDocs).toBe(3);
  });
});

describe("Get Users By Filtering", () => {
  const getUsers = async (filter, page = 1, limit = 10) => {
    let agent = request(app)
      .post("/api/1.0/user/filter")
      .query({ page, limit })
      .set("origin", "localhost:7001");

    if (token) {
      agent.set("x-access-token", token);
    }

    return await agent.send(filter);
  };

  it("return - HTTP 200 ok when we successfuly fetch users", async () => {
    await addUser(1, {
      ...mockData.user1,
      userId: {
        ...mockData.user1.userId,
        matricNumber: "LCU/UG/21/18000",
        firstname: "John",
        lastname: "Doe",
        _id: "648f67cec5b0acf0bfe9f700",
        department: "Law",
      },
    });
    await addUser(1, {
      ...mockData.user1,
      userId: {
        ...mockData.user1.userId,
        matricNumber: "LCU/UG/21/18001",
        firstname: "John1",
        lastname: "Doe1",
        _id: "648f67cec5b0acf0bfe9f701",
        department: "Law",
      },
    });
    await addUser(1, {
      ...mockData.user1,
      userId: {
        ...mockData.user1.userId,
        matricNumber: "LCU/UG/21/18002",
        firstname: "John2",
        lastname: "Doe2",
        _id: "648f67cec5b0acf0bfe9f702",
        department: "Law",
      },
    });
    await addUser(3);
    await porterLogin();

    const response = await getUsers({ department: "Law" });

    expect(response.status).toBe(200);
  });

  it("return - user data of filter users after successful api call", async () => {
    await addUser(1, {
      ...mockData.user1,
      userId: {
        ...mockData.user1.userId,
        matricNumber: "LCU/UG/21/18000",
        firstname: "John",
        lastname: "Doe",
        _id: "648f67cec5b0acf0bfe9f700",
        department: "Law",
      },
    });
    await addUser(1, {
      ...mockData.user1,
      userId: {
        ...mockData.user1.userId,
        matricNumber: "LCU/UG/21/18001",
        firstname: "John1",
        lastname: "Doe1",
        _id: "648f67cec5b0acf0bfe9f701",
        department: "Law",
      },
    });
    await addUser(1, {
      ...mockData.user1,
      userId: {
        ...mockData.user1.userId,
        matricNumber: "LCU/UG/21/18002",
        firstname: "John2",
        lastname: "Doe2",
        _id: "648f67cec5b0acf0bfe9f702",
        department: "Law",
      },
    });
    await addUser(3);
    await porterLogin();

    const response = await getUsers({ department: "Law" });

    expect(response.body.totalDocs).toBe(3);
  });

  it("check - ensure users match the filter passed into the api call", async () => {
    await addUser(1, {
      ...mockData.user1,
      userId: {
        ...mockData.user1.userId,
        matricNumber: "LCU/UG/21/18000",
        firstname: "John",
        lastname: "Doe",
        _id: "648f67cec5b0acf0bfe9f700",
        department: "Law",
      },
    });
    await addUser(1, {
      ...mockData.user1,
      userId: {
        ...mockData.user1.userId,
        matricNumber: "LCU/UG/21/18001",
        firstname: "John1",
        lastname: "Doe1",
        _id: "648f67cec5b0acf0bfe9f701",
        department: "Law",
      },
    });
    await addUser(1, {
      ...mockData.user1,
      userId: {
        ...mockData.user1.userId,
        matricNumber: "LCU/UG/21/18002",
        firstname: "John2",
        lastname: "Doe2",
        _id: "648f67cec5b0acf0bfe9f702",
        department: "Law",
      },
    });
    await addUser(3);
    await porterLogin();

    const response = await getUsers({ department: "Law" });
    let filterCheck = true;

    for (let i = 0; i < 3; i++) {
      if (response.body.docs[i].department != "Law") {
        filterCheck = false;
      }
    }
    expect(filterCheck).toBe(true);
  });

  
  it("return - user data of filter users after successful api call", async () => {
    const hostels = await addHostel();
    const rooms = await addRoom(hostels[0].id);
    await addUser(1, {
      ...mockData.user1,
      userId: {
        ...mockData.user1.userId,
        matricNumber: "LCU/UG/21/18000",
        firstname: "John",
        lastname: "Doe",
        _id: "648f67cec5b0acf0bfe9f700",
        department: "Law",
      },
      room: rooms[0].id
    });
    await addUser(1, {
      ...mockData.user1,
      userId: {
        ...mockData.user1.userId,
        matricNumber: "LCU/UG/21/18001",
        firstname: "John1",
        lastname: "Doe1",
        _id: "648f67cec5b0acf0bfe9f701",
        department: "Law",
      },
      room: rooms[1].id
    });
    await addUser(1, {
      ...mockData.user1,
      userId: {
        ...mockData.user1.userId,
        matricNumber: "LCU/UG/21/18002",
        firstname: "John2",
        lastname: "Doe2",
        _id: "648f67cec5b0acf0bfe9f702",
        department: "Law",
      },
      room: rooms[2].id
    });
    await addUser(3);
    await porterLogin();

    const response = await getUsers({ department: "Law" });

    expect(response.body.totalDocs).toBe(3);
    expect(response.body.docs[0].room.hostel.name).toBe(hostels[0].name);

  });
});
