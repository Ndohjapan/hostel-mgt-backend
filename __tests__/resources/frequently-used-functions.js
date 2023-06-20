const request = require("supertest");
const { User, Porter, Room, Hostel } = require("../../src/database/model");
const mockData = require("./mock-data");
const app = require("../../src/app");
const porterCredentials = { email: "porter1@mail.com", password: "P4ssword" };

let token;

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
  return token;
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

module.exports = {addUser, porterLogin, addHostel, addRoom};