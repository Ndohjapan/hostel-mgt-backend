const { porterAuth } = require("../middleware/protect");
const { validateHostelId, validateHostelDataInput } = require("../middleware/hostel-input-validation");
const { HostelService } = require("../service/hostel-service");
const catchAsync = require("../util/catch-async");

module.exports = async(app) => {
  const service = new HostelService();


  app.post("/api/1.0/hostel", validateHostelDataInput, porterAuth, catchAsync(async(req, res) => {
    const hostelData = req.body;
    const hostels = await service.CreateHostel(hostelData);
    res.send(hostels);
  }));

  app.get("/api/1.0/hostel/", porterAuth, catchAsync(async(req, res) => {
    const hostels = await service.FindAll();
    res.send(hostels);
  }));

  app.get("/api/1.0/hostel/:id", validateHostelId, porterAuth, catchAsync(async(req, res) => {
    let id = req.params.id;
    const hostel = await service.FindById(id);
    res.send(hostel);
  }));

  app.post("/api/1.0/hostel/filter", porterAuth, catchAsync(async(req, res) => {
    const data = req.body;
    const users = await service.FilterHostels({data});
    res.send(users);
  }));

  app.patch("/api/1.0/hostel/:id", validateHostelId, porterAuth, catchAsync(async(req, res) => {
    let id = req.params.id;
    let data = req.body;
    const hostel = await service.UpdateOne(id, data);
    res.send(hostel);

  }));

};