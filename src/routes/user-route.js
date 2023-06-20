const { porterAuth } = require("../middleware/protect");
const { validateUserId, validateUserRoomAssignmentInput, validateUserRoomRemovalInput } = require("../middleware/user-input-validation");
const { RoomService } = require("../service/room-service");
const { UserService } = require("../service/user-service");
const catchAsync = require("../util/catch-async");

module.exports = async(app) => {
  const service = new UserService();
  const roomService = new RoomService();

  app.get("/api/1.0/user", porterAuth, catchAsync(async(req, res) => {
    let {page, limit} = req.query;
    page = page ? page : 1;
    limit = limit ? limit : 10;
    const users = await service.FindAll({page, limit});
    res.send(users);
  }));

  app.get("/api/1.0/user/:id", validateUserId, porterAuth, catchAsync(async(req, res) => {
    let id = req.params.id;
    const user = await service.FindById(id);
    res.send(user);
  }));

  app.post("/api/1.0/user/filter", porterAuth, catchAsync(async(req, res) => {
    const data = req.body;
    let {page, limit} = req.query;
    page = page ? page : 1;
    limit = limit ? limit : 10;
    const users = await service.FilterUsers({page, limit, data});
    res.send(users);
  }));

  app.post("/api/1.0/user/assign", validateUserRoomAssignmentInput, porterAuth, catchAsync(async(req, res) => {
    const {roomId, userId} = req.body;
    await roomService.AssignToRoom(roomId, userId);
    const user = await service.UpdateOne(userId, {room: roomId});
    res.send(user);
  }));

  app.post("/api/1.0/user/remove", validateUserRoomRemovalInput, porterAuth, catchAsync(async(req, res) => {
    const {userId} = req.body;
    let user = await service.FindById(userId);
    await roomService.RemoveFromRoom(user.room._id, userId);
    user = await service.UpdateOne(userId, {room: null});
    res.send(user);
  }));


};