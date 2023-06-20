// seed.js
const { HostelService } = require("../service/hostel-service");
const { RoomService } = require("../service/room-service");
const { connectToDatabase, mongoose } = require("./connection");
const { Porter, Hostel, Room } = require("./model");
const seedData = require("./seeData");
const roomService = new RoomService();
const hostelService = new HostelService();

async function up() {

  try {
    
    await connectToDatabase();

    await Porter.create(seedData.porter[0]);
    const hostels = await Hostel.create(seedData.hostel);
    
    await roomService.CreateRooms({hostel: hostels[0].id, from: 101, to: 114, maxPerRoom: 4});
    
    await roomService.CreateRooms({hostel: hostels[1].id, from: 211, to: 230, maxPerRoom: 2});

    await roomService.CreateRooms({hostel: hostels[1].id, from: 101, to: 130, maxPerRoom: 2});

    const rooms1 = await Room.find({hostel: hostels[0].id}).sort({roomNum: 1});
    const rooms2 = await Room.find({hostel: hostels[1].id}).sort({roomNum: 1});

    await hostelService.SetRoomRange(rooms1, hostels[0].id);
    await hostelService.SetRoomRange(rooms2, hostels[1].id);

    console.log("Seeding completed successfully");
  } catch (err) {
    console.log(err.message);
  } finally {
    await mongoose.connection.close();
  }
}

async function down() {

  try {
    await connectToDatabase();

    await mongoose.connection.dropDatabase();

    console.log("Data removal completed successfully");
  } catch (err) {
    console.error("Error removing data from the database:", err);
  } finally {
    await mongoose.connection.close();
  }
}

// Run the "up" or "down" function based on the command-line argument
// eslint-disable-next-line no-undef
if (process.argv[2] === "up") {
  up();
// eslint-disable-next-line no-undef
} else if (process.argv[2] === "down") {
  down();
} else {
  console.error("Invalid command. Please specify either \"up\" or \"down\".");
}
