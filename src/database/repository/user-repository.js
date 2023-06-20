const en = require("../../../locale/en");
const internalException = require("../../error/internal-exception");
const { User } = require("../model");

class UserRepository {
  async CreateUser(filter, update){
    try {
      const options = {upsert: true, new: true};
      const user = await User.findOneAndUpdate(filter, update, options);
      return user;
    } catch (err) {
      throw new internalException(
        en.user_server_error
      );
    }
  }

  async FindUserById(id){
    try {
      const user = await User.findById(id);
      return user;
    } catch (error) {
      throw new internalException(
        en.user_server_error
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
          select: "-password"
        };
    
        User.paginate({}, options, function (err, result) {
          if (err) {
            throw Error("Error in getting users");
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

  
  async UpdateOne({id, updateData}){
    try {
      const user = await User.findByIdAndUpdate(id, updateData, {new: true});
      return user;
        
    } catch (error) {
      throw new internalException(
        en.room_update_server_error
      );
    }
  }

  async FilterUsers({page, limit, data}){
    // eslint-disable-next-line no-unused-vars
    return new Promise((resolve, reject) => {
      try {
        const options = {
          sort: { createdAt: -1 },
          page,
          limit,
          select: "-password"
        };
    
        User.paginate(data, options, function (err, result) {
          if (err) {
            throw Error("Error in getting users");
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

  async validatePassword({user, password}){
    return await user.validatePassword(password);
  }
}

module.exports = UserRepository;