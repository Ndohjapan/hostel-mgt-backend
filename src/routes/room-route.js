const { validateHostelId } = require("../middleware/hostel-input-validation");
const { porterAuth } = require("../middleware/protect");
const { validateRoomId, validateRoomDataInput} = require("../middleware/room-input-validation");
const { HostelService } = require("../service/hostel-service");
const { RoomService } = require("../service/room-service");

const catchAsync = require("../util/catch-async");

module.exports = async(app) => {
  const service = new RoomService();
  const hostelService = new HostelService();

  app.post("/api/1.0/room", validateRoomDataInput, porterAuth, catchAsync(async(req, res) => {
    const roomData = req.body;
    const hostel = roomData.hostel;
    const rooms = await service.CreateRooms(roomData);

    const allRooms = await service.FilterRooms({page: 1, limit: 900, data: {hostel}});

    await hostelService.SetRoomRange(allRooms.docs, hostel);
    res.send(rooms);
  }));

  app.get("/api/1.0/room/", porterAuth, catchAsync(async(req, res) => {
    let {page, limit} = req.query;
    page = page ? page : 1;
    limit = limit ? limit : 10;
    const users = await service.FindAll({page, limit});
    res.send(users);
  }));

  app.get("/api/1.0/room/:id", validateRoomId, porterAuth, catchAsync(async(req, res) => {
    let id = req.params.id;
    const hostel = await service.FindById(id);
    res.send(hostel);
  }));

  app.post("/api/1.0/room/filter", porterAuth, catchAsync(async(req, res) => {
    const data = req.body;
    let {page, limit} = req.query;
    page = page ? page : 1;
    limit = limit ? limit : 10;
    const rooms = await service.FilterRooms({page, limit, data});
    res.send(rooms);
  }));

  app.patch("/api/1.0/room/:id", validateRoomId, porterAuth, catchAsync(async(req, res) => {
    let id = req.params.id;
    let data = req.body;
    const hostel = await service.UpdateOne(id, data);
    res.send(hostel);

  }));

  app.get("/api/1.0/room/available/:id", validateHostelId, porterAuth, catchAsync(async(req, res) => {
    const hostelId = req.params.id;
    const rooms = await service.FindAvailableRooms(hostelId);
    res.send(rooms);
  }));

};