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
      const room = await Room.findById(id);
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
          en.user_server_error
        );
      }

    });
  }

  async UpdateUserPayments(userId, updateData){
    try {
      const userPayment = await Room.findOneAndUpdate({userId}, {$inc: updateData}, {new: true}).populate("userId", "-password");
      return userPayment;
          
    } catch (error) {
      throw new internalException(
        en.user_server_error
      );
    }
  }

}

module.exports = RoomRepository;