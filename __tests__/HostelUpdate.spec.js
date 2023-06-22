/* eslint-disable no-undef */
const request = require("supertest");
const app = require("../src/app");
const {
  connectToDatabase,
  mongoose
} = require("../src/database/connection");
const mockData = require("./resources/mock-data");
const { Porter, Hostel } = require("../src/database/model");
const en = require("../locale/en");
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
describe("Update One Hostel", () => {
  const updateHostel = async (id, updateData) => {
    let agent = request(app)
      .patch(`/api/1.0/hostel/${id}`)
      .set("origin", "localhost:7001");

    if (token) {
      agent.set("x-access-token", token);
    }

    return await agent.send(updateData);
  };

  it("return - HTTP 400 when we try to update with a negative number", async() => {
    const hostels = await addHostel();
    await porterLogin();
    const response = await updateHostel(hostels[0].id, {maxPerRoom: -1});

    expect(response.status).toBe(400);
  });

  it(`return - ${en.max_per_room_format} when we try to update with a negative number`, async() => {
    const hostels = await addHostel();
    await porterLogin();
    const response = await updateHostel(hostels[0].id, {maxPerRoom: 0});

    expect(response.body.message).toBe(en.validation_failure);
    expect(response.body.validationErrors.maxPerRoom).toBe(en.max_per_room_format);
  });

  it("return - HTTP 400 when we try to update with a wrong sex", async() => {
    const hostels = await addHostel();
    await porterLogin();
    const response = await updateHostel(hostels[0].id, {sex: "Foreign"});

    expect(response.status).toBe(400);
  });

  it(`return - ${en.sex_format} when we try to update with a negative number`, async() => {
    const hostels = await addHostel();
    await porterLogin();
    const response = await updateHostel(hostels[0].id, {sex: "Foreign"});

    expect(response.body.message).toBe(en.validation_failure);
    expect(response.body.validationErrors.sex).toBe(en.sex_format);
  });

  it("return - HTTP 200 ok when update is successful", async() => {
    const hostels = await addHostel();
    await porterLogin();
    const response = await updateHostel(hostels[0].id, {maxPerRoom: 5});

    expect(response.status).toBe(200);
  });

  it("return - updated hostel data when update is successful", async() => {
    const hostels = await addHostel();
    await porterLogin();
    const response = await updateHostel(hostels[0].id, {maxPerRoom:5});

    expect(response.body.maxPerRoom).toBe(5);

  });

  it("check - ensure hostel is updated in database when update is successful", async() => {
    const hostels = await addHostel();
    await porterLogin();
    await updateHostel(hostels[0].id, {maxPerRoom:5});

    const updatedHostels = await Hostel.findById(hostels[0].id);

    expect(updatedHostels.maxPerRoom).toBe(5);
  });

  it("check - update more than one field and check if it update was successful", async() => {
    const hostels = await addHostel();
    await porterLogin();
    await updateHostel(hostels[0].id, {maxPerRoom:5, name: "Block U"});

    const updatedHostels = await Hostel.findById(hostels[0].id);

    expect(updatedHostels.maxPerRoom).toBe(5);
    expect(updatedHostels.name).toBe("Block U");

  });

  it("check - ensure empty fields cannot be updated", async() => {
    const hostels = await addHostel();
    await porterLogin();
    await updateHostel(hostels[0].id, {maxPerRoom:5, name: ""});

    const updatedHostels = await Hostel.findById(hostels[0].id);

    expect(updatedHostels.maxPerRoom).toBe(5);
    expect(updatedHostels.name).toBe(mockData.hostel.name);


  });

  it("check - ensure porter cannot update the numbe of students and number of rooms", async() => {
    const hostels = await addHostel();
    await porterLogin();
    await updateHostel(hostels[0].id, {totalStudents: 20, totalRooms: 10});

    const updatedHostels = await Hostel.findById(hostels[0].id);

    expect(updatedHostels.totalRooms).toBe(0);
    expect(updatedHostels.totalStudents).toBe(0);
  });
});

