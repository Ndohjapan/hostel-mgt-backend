const RoomRepository = require("../database/repository/room-repository");const en = require("../../locale/en");
const NotFoundException = require("../error/not-found-exception");
const UpdateException = require("../error/update-exception");

class RoomService{
  constructor(){
    this.repository = new RoomRepository();      
  }

  async CreateRooms(data){
    try {
      const room = [];
      for(let i=data.from; i<=data.to; i++){
        room.push({
          hostel: data.hostel,
          maxPerRoom: data.maxPerRoom,
          roomNum: i,
        });
      }
      const rooms = await this.repository.CreateRooms(room);
      return rooms;
      
    } catch (error) {
      throw new UpdateException(error.message);
    }
  }

  async FindById(id){
    try {
      const hostel = await this.repository.FindRoomById(id);

      return hostel;
      
    } catch (error) {
      throw new NotFoundException(en.room_not_found);
    }
  }

  async FindAll({page, limit}){
    try {
      const users = await this.repository.FindAll({page, limit});
      return users;
    } catch (error) {
      throw new NotFoundException(en.user_not_found);
        
    }
  }

  async FilterRooms({page, limit, data}){
    let updateData = {};

    Object.entries(data).forEach(([key, value]) => {
      if (value != "") {
        updateData[key] = value;
      }
    });

    try {
      const users = await this.repository.FilterRooms({page, limit, data});
      return users;
    } catch (error) {
      throw new NotFoundException();
    }
  }

  async UpdateOne(id, data){
    let updateData = {};

    data.students = "";
    data.hostel = "";
    data.roomNum = "";

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

}

module.exports = {RoomService};