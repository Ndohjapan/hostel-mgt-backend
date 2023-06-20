const mongoose = require("mongoose");
const amqp = require("amqplib");

async function connectToDb() {
  await mongoose.connect("mongodb://127.0.0.1:27017/hostel-mgt", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  console.log("connected successfully");
}

const HostelSchema = new mongoose.Schema({
  name: String,
  maxNumPerRoom: String,
  sex: String,
});

const RoomSchema = new mongoose.Schema({
  hostel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "hostel",
  },
  maxNum: String,
  roomNum: String,
});

RoomSchema.index({ hostel: 1, roomNum: 1 }, { unique: true });

const Hostel = mongoose.model("hostel", HostelSchema);
const Room = mongoose.model("room", RoomSchema);

connectToDb();

async function getRoomRangesByHostel(hostelId) {
  const rooms = await Room.find({ hostel: hostelId }).sort("roomNum");
  const roomRanges = [];

  let currentRange = null;

  for (const room of rooms) {
    const roomNum = parseInt(room.roomNum);

    if (currentRange === null) {
      currentRange = { start: roomNum, end: roomNum };
    } else if (roomNum === currentRange.end + 1) {
      currentRange.end = roomNum;
    } else {
      roomRanges.push(getFormattedRange(currentRange));
      currentRange = { start: roomNum, end: roomNum };
    }
  }

  if (currentRange !== null) {
    roomRanges.push(getFormattedRange(currentRange));
  }

  const totalRooms = rooms.length;

  return {
    totalRooms,
    roomRange: roomRanges,
  };
}

function getFormattedRange(range) {
  if (range.start === range.end) {
    return range.start.toString();
  } else {
    return `${range.start} - ${range.end}`;
  }
}

// Usage example
// const hostelId = '648832e2091b018e2c90c366';
// getRoomRangesByHostel(hostelId)
//   .then(result => console.log(result))
//   .catch(error => console.error(error));

async function consumeMessages() {
  const connection = await amqp.connect("amqp://localhost");
  const channel = await connection.createChannel();

  await channel.assertExchange("schoolExchange", "direct");

  const q = await channel.assertQueue("HostelPaymentQueue");

  await channel.bindQueue(q.queue, "schoolExchange", "hostel");

  channel.consume(q.queue, async (msg) => {
    const data = JSON.parse(msg.content);
    console.log(data);
    // await Error.create({logType: data.logType, message: data.message});
    channel.ack(msg);
  });
}

consumeMessages();
