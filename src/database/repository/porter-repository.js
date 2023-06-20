const en = require("../../../locale/en");
const internalException = require("../../error/internal-exception");
const { Porter } = require("../model");

class PorterRepository {
  async FindPorterByEmail({email}){
    try {
      const existingPorter = await Porter.findOne({ email }).excludeFields(["createdAt", "updatedAt"]);
      return existingPorter;
    } catch (err) {
      throw new internalException(
        en.porter_server_error
      );
    }
  }

  async FindPorterById(id){
    try {
      const porter = await Porter.findById(id).excludeFields(["password", "createdAt", "updatedAt"]);
      return porter;
    } catch (error) {
      throw new internalException(
        en.porter_server_error
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
    
        Porter.paginate({}, options, function (err, result) {
          if (err) {
            throw Error("Error in getting porters");
          } else {
            resolve(result);
          }
        });
    
      } catch (error) {
        throw new internalException(
          en.porter_server_error
        );
      }

    });
  }

  async UpdateOne({id, updateData}){
    try {
      const porter = await Porter.findOneAndUpdate({_id: id}, updateData, {new: true});
      return porter;
        
    } catch (error) {
      throw new internalException(
        en.porter_server_error
      );
    }

  }

  async FilterPorters({page, limit, data}){
    // eslint-disable-next-line no-unused-vars
    return new Promise((resolve, reject) => {
      try {
        const options = {
          sort: { createdAt: -1 },
          page,
          limit,
          select: "-password"
        };
    
        Porter.paginate(data, options, function (err, result) {
          if (err) {
            throw Error("Error in getting porters");
          } else {
            resolve(result);
          }
        });
    
      } catch (error) {
        throw new internalException(
          en.porter_server_error
        );
      }

    });
  }

  async validatePassword({porter, password}){
    return await porter.validatePassword(password);
  }
}

module.exports = PorterRepository;