/* eslint-disable no-undef */
const { connectToDatabase, mongoose } = require("../src/database/connection");
const { User } = require("../src/database/model");
const { UserService } = require("../src/service/user-service");
const mockData = require("./resources/mock-data");
const service = new UserService();

// eslint-disable-next-line no-undef
beforeEach(async () => {
  await connectToDatabase();
});
  
// eslint-disable-next-line no-undef
afterEach(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

const adduser = async(user = mockData.user1) => {
  await service.CreateUser(user);
};

describe("Create User", () => {
  it("check - ensure if the user is created once it recieves a payment", async() => {
    await adduser();

    const users = await User.find({});
    expect(users.length).toBe(1);
  });

  it("check - ensure the percentage of payment is calculated properly", async() => {
    await adduser();
    
    const users = await User.find({});
    const percentage = (mockData.user1.hostel.amountPaid / mockData.user1.hostel.amount) * 100; 
    expect(users[0].percentage).toBe(percentage);
    
  });

  it("check - ensure the total amount and amount paid are saved correctly", async() => {
    await adduser();
    
    const users = await User.find({});
    expect(users[0].totalAmount).toBe(mockData.user1.hostel.amount);
    expect(users[0].amountPaid).toBe(mockData.user1.hostel.amountPaid);
  });

  it("check - ensure the matric number is well saved", async() => {
    await adduser();
    
    const users = await User.find({});
    expect(users[0].matricNumber).toBe(mockData.user1.userId.matricNumber);
  });
});

