const { porterAuth } = require("../middleware/protect");
const { validateUserId } = require("../middleware/user-input-validation");
const { UserService } = require("../service/user-service");
const catchAsync = require("../util/catch-async");

module.exports = async(app) => {
  const service = new UserService();

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


};