const HostelRepository = require("../database/repository/hostel-repository");const en = require("../../locale/en");
const NotFoundException = require("../error/not-found-exception");
const UpdateException = require("../error/update-exception");

class HostelService{
  constructor(){
    this.repository = new HostelRepository();      
  }

  async CreateHostel(data){
    try {
      const hostel = await this.repository.CreateHostel(data);
      return hostel;
      
    } catch (error) {
      throw new UpdateException(error.message);
    }
  }

  async FindById(id){
    try {
      const hostel = await this.repository.FindHostelById(id);

      return hostel;
      
    } catch (error) {
      throw new NotFoundException(en.hostel_not_found);
    }
  }

  async FindAll(){
    try {
      const hostels = await this.repository.FindAll();
      return hostels;
    } catch (error) {
      console.log(error);
      throw new NotFoundException(en.hostel_not_found);
        
    }
  }

  async UpdateOne(id, data){
    let updateData = {};

    data.totalRooms = "";
    data.totalStudents = "";

    Object.entries(data).forEach(([key, value]) => {
      if (value != "") {
        updateData[key] = value;
      }
    });
    
    try {
      const user = await this.repository.UpdateOne({id, updateData});
    
      return user;
        
    } catch (error) {
      throw new   UpdateException();        
    }    
  }

  async FilterHostels({data}){
    let updateData = {};

    Object.entries(data).forEach(([key, value]) => {
      if (value != "") {
        updateData[key] = value;
      }
    });

    try {
      const users = await this.repository.FilterHostels({data});
      return users;
    } catch (error) {
      throw new NotFoundException();
    }
  }

  async SetRoomRange(rooms, hostelId){
    const roomRange = [];

    let currentRange = null;

    for (const room of rooms) {
      const roomNum = parseInt(room.roomNum);

      if (currentRange === null) {
        currentRange = { start: roomNum, end: roomNum };
      } else if (roomNum === currentRange.end + 1) {
        currentRange.end = roomNum;
      } else {
        roomRange.push(await this.getFormattedRange(currentRange));
        currentRange = { start: roomNum, end: roomNum };
      }
    }

    if (currentRange !== null) {
      roomRange.push(await this.getFormattedRange(currentRange));
    }

    const totalRooms = rooms.length;

    await this.repository.UpdateOne({id: hostelId, updateData: {roomRange, totalRooms}});
    
  }

  async getFormattedRange(range) {
    if (range.start === range.end) {
      return range.start.toString();
    } else {
      return `${range.start} - ${range.end}`;
    }
  }

}

module.exports = {HostelService};