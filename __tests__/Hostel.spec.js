/* eslint-disable no-undef */
const request = require("supertest");
const app = require("../src/app");
const { connectToDatabase, mongoose } = require("../src/database/connection");
const { Hostel, Porter } = require("../src/database/model");
const mockData = require("./resources/mock-data");
const porterCredentials = { email: "porter1@mail.com", password: "P4ssword" };
const hostelData = mockData.hostel;

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

describe("Create Hostel", () => {
  const createHostel = async (data = hostelData) => {
    let agent = request(app)
      .post("/api/1.0/hostel/")
      .set("origin", "localhost:7001");

    if (token) {
      agent.set("x-access-token", token);
    }

    return await agent.send(data);
  };

  it("return - HTTP 200 ok when the hostel is created successfully", async () => {
    await porterLogin();

    const response = await createHostel();

    expect(response.status).toBe(200);
  });


  it("checks - database to ensure hostel document was saved", async() => {
    await porterLogin();

    await createHostel();

    const hostelDb = await Hostel.find({});

    expect(hostelDb.length).toBe(1);
    expect(hostelDb[0].name).toBe(mockData.hostel.name);
  });

  /**
 * Test to ensure we cannot duplicate any hostel
 */

  //   it("return - HTTP 400 when we try to create 2 hostels of the same name", async() => {
  //     await porterLogin();

  //     await createHostel();
  //     const response = await createHostel();

  //     expect(response.status).toBe(400);
  //   });

  
  //   it("return - 'Name already exists' when we try to create 2 hostels of the same name", async() => {
  //     await porterLogin();

  //     await createHostel();
  //     const response = await createHostel();

  //     expect(response.body.message).toBe("name already exists");
  //   });

  it("returns - hostel document when hostel is created successfully", async() => {
    await porterLogin();

    const response = await createHostel();


    expect(response.body.name).toBe(mockData.hostel.name);
  });

});
