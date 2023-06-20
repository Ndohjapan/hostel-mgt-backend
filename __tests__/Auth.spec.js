/* eslint-disable no-undef */
const request = require("supertest");
const app = require("../src/app");
const {
  connectToDatabase,
  mongoose
} = require("../src/database/connection");
const { Porter, RefreshToken } = require("../src/database/model");
const mockData = require("./resources/mock-data");
const en = require("../locale/en");
const porterCredentials = { email: "porter1@mail.com", password: "P4ssword" };

let refreshToken;

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
  let agent = await request(app)
    .post("/api/1.0/auth")
    .set("origin", "localhost:7001")
    .send(porter);

  // Extract the access token from the response body
  if(agent.body.tokens){
    refreshToken = agent.body.tokens.refreshToken;
  }
  return agent;
};


const porterLogout = async () => {
  let agent = await request(app)
    .post("/api/1.0/logout")
    .set("origin", "localhost:7001")
    .set("x-access-token", refreshToken)
    .send();

  return agent;
};

describe("Porter Login", () => {
  it("return - HTTP 400 when we try to pass an empty password", async () => {
    await addPorter();
    const response = await porterLogin({ ...porterCredentials, password: "" });

    expect(response.status).toBe(400);
  });

  it(`return - "${en.password_null}" when we try to pass an empty password`, async () => {
    await addPorter();
    const response = await porterLogin({ ...porterCredentials, password: "" });

    expect(response.body.validationErrors.password).toBe(en.password_null);
  });

  it("return - HTTP 400 when we try to pass an object password", async () => {
    await addPorter();
    const response = await porterLogin({
      ...porterCredentials,
      password: { hello: "world" },
    });

    expect(response.status).toBe(400);
  });

  it(`return - "${en.password_format}" when we try to pass an object password`, async () => {
    await addPorter();
    const response = await porterLogin({
      ...porterCredentials,
      password: { hello: "world" },
    });

    expect(response.body.validationErrors.password).toBe(en.password_format);
  });

  it("return - HTTP 400 when we try to pass an empty email", async () => {
    await addPorter();
    const response = await porterLogin({ ...porterCredentials, email: "" });

    expect(response.status).toBe(400);
  });

  it(`return - "${en.email_null}" when we try to pass an empty email`, async () => {
    await addPorter();
    const response = await porterLogin({ ...porterCredentials, email: "" });

    expect(response.body.validationErrors.email).toBe(en.email_null);
  });

  it("return - HTTP 400 when we try to pass an object email", async () => {
    await addPorter();
    const response = await porterLogin({
      ...porterCredentials,
      email: { hello: "world" },
    });

    expect(response.status).toBe(400);
  });

  it(`return - "${en.email_format}" when we try to pass an object email`, async () => {
    await addPorter();
    const response = await porterLogin({
      ...porterCredentials,
      email: { hello: "world" },
    });

    expect(response.body.validationErrors.email).toBe(en.email_format);
  });

  it("return - HTTP 400 when we login with wrongly formatted email", async () => {
    await addPorter();

    const response = await porterLogin({ ...porterCredentials, email: "wrong" });


    expect(response.body.validationErrors.email).toBe(en.email_format);

  });

  it(`return - "${en.email_format}" when we try to a wrongly formatted email`, async () => {
    await addPorter();

    const response = await porterLogin({ ...porterCredentials, email: "wrong" });

    expect(response.body.validationErrors.email).toBe(en.email_format);

  });

  it("return - HTTP 401 when we login with invalid email", async () => {
    await addPorter();

    const response = await porterLogin({ ...porterCredentials, email: "porter2@mail.com" });

    expect(response.status).toBe(401);
  });

  it(`return - "${en.login_failure}" when we login with invalid email`, async () => {
    await addPorter();

    const response = await porterLogin({ ...porterCredentials, email: "porter2@mail.com" });

    expect(response.body.message).toBe(en.login_failure);
  });

  it("return - HTTP 401 when we login with invalid password", async () => {
    await addPorter();

    const response = await porterLogin({ ...porterCredentials, password: "porter2@mail.com" });

    expect(response.status).toBe(401);
  });

  it(`return - "${en.login_failure}" when we login with invalid password`, async () => {
    await addPorter();

    const response = await porterLogin({ ...porterCredentials, password: "porter2@mail.com" });

    expect(response.body.message).toBe(en.login_failure);
  });

  it("returns - proper error body when authentication fails", async () => {
    await addPorter();
    const nowInMillis = new Date().getTime();
    const response = await porterLogin({ ...porterCredentials, email: "porter2@mail.com" });
    const error = response.body;

    expect(error.path).toBe("/api/1.0/auth");
    expect(error.timestamp).toBeGreaterThan(nowInMillis);
    expect(Object.keys(error)).toEqual(["path", "timestamp", "message"]);
  });

  it("return - HTTP 200 OK when the login is successful ", async () => {
    await addPorter();
    const response = await porterLogin();


    expect(response.status).toBe(200);
  });

  it("returns - porter data when the login is successful", async () => {
    await addPorter();
    const response = await porterLogin();

    expect(response.body.porter.firstname).toBe(mockData.porter1.firstname);
  });

  it("check - ensure no password, createdAt and updatedAt is returned on successful login", async () => {
    await addPorter();
    const response = await porterLogin();

    expect(response.body.password).toBeFalsy();
    expect(response.body.createdAt).toBeFalsy();
    expect(response.body.updatedAt).toBeFalsy();
  });

  it("check - the token collection to see if the porter token is registered", async () => {
    const porter = await addPorter();
    await porterLogin();

    const token = await RefreshToken.find({});

    expect(token.length).toBe(1);
    expect(token[0].userId.toString()).toBe(porter.id);
  });

  // check if you can access protected route
  // check token before login
  // check token after login
}); 

describe("Porter Logout", () => {
  it("return - HTTP 200 ok after logout", async () => {
    await addPorter();
    await porterLogin();

    const response = await porterLogout();

    expect(response.status).toBe(204);
  });

  it("check - the token collection to see if the porter token is deleted", async () => {
    await addPorter();
    await porterLogin();

    const tokensBefore = await RefreshToken.find({});
    

    await porterLogout();
    const tokens = await RefreshToken.find({});
    

    expect(tokensBefore.length).toBe(1);
    expect(tokens.length).toBe(0);
  });

});

