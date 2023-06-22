const mongoose = require("mongoose");
const en = require("../../../locale/en");
const internalException = require("../../error/internal-exception");
const { Room } = require("../model");

class RoomRepository {

  async CreateRooms(rooms){
    try {
      rooms = await Room.create(rooms);
      return rooms;
    } catch (error) {
      if(error.code == 11000){
        throw new internalException(
          en.room_duplicate_error
        );

      }
    }
  }

  async FindRoomById(id){
    try {
      const room = await Room.findById(id).populate("students");
      return room;
    } catch (error) {
      throw new internalException(
        en.room_not_found
      );
    }
  }

  async FindAll({page, limit}){
    // eslint-disable-next-line no-unused-vars
    return new Promise((resolve, reject) => {
      try {
        const options = {
          sort: { createdAt: -1 },
          page,
          limit,
          populate: { path: "hostel" }
        };
    
        Room.paginate({}, options, function (err, result) {
          if (err) {
            throw Error("Error in getting users' payments");
          } else {
            resolve(result);
          }
        });
    
      } catch (error) {
        throw new internalException(
          en.room_not_found
        );
      }

    });
  }

  async UpdateOne({id, updateData}){
    try {
      const user = await Room.findByIdAndUpdate(id, updateData, {new: true});
      return user;
        
    } catch (error) {
      throw new internalException(
        en.room_update_server_error
      );
    }
  }

  async FilterRooms({page, limit, data}){
    // eslint-disable-next-line no-unused-vars
    return new Promise((resolve, reject) => {
      try {
        const options = {
          sort: { roomNum: 1 },
          page,
          limit,
          populate: ["hostel"]
        };
    
        Room.paginate(data, options, function (err, result) {
          if (err) {
            throw Error("Error in getting users' payment");
          } else {
            resolve(result);
          }
        });
    
      } catch (error) {
        throw new internalException(
          en.room_not_found
        );
      }

    });
  }

  async FilterAvailableRooms(hostelId){
    try {

      const convertedHostelId = new mongoose.Types.ObjectId(hostelId);  

      const vacantRooms = await Room.aggregate([
        {
          $match: { hostel:  convertedHostelId}
        },
        {
          $project: {
            _id: 1,
            hostel: 1,
            maxPerRoom: 1,
            numOfStudents: 1,
            roomNum: 1,
            hasVacancy: { $lt: ["$numOfStudents", "$maxPerRoom"] }
          }
        },
        {
          $match: { hasVacancy: true }
        }
      ]);

      return vacantRooms;
    } catch (error) {
      console.log(error);
      throw new internalException(
        en.room_not_found
      );
    }
  }

  async AssignToRoom(roomId, userId){
    try {
      const existingRoom = await Room.findOne({ students: userId });

      if(existingRoom){
        throw new Error(en.user_room_duplicate_error);
      }
        
      const room = await Room.findById(roomId);

      if (room.students.length >= room.maxPerRoom) {
        throw new Error(en.room_is_full + room.maxPerRoom);
      }
        
      room.students.addToSet(userId);
        
      const result = await room.save();
      return result;
          
    } catch (error) {
      throw new internalException(
        error.message
      );
    }
  }

  async RemoveFromRoom(roomId, userId){
    try {
      const room = await Room.findByIdAndUpdate(
        roomId,
        { $pull: { students: userId } },
        { new: true }
      );
          
      // Update the numOfStudents field
      await Room.updateOne(
        { _id: roomId },
        { $set: { numOfStudents: room.students.length } }
      );

      return room;
          
    } catch (error) {
      throw new internalException(
        error.message
      );
    }
  }

}

module.exports = RoomRepository;