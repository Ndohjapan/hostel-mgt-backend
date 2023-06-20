const en = require("../../../locale/en");
const internalException = require("../../error/internal-exception");
const { Hostel } = require("../model");

class HostelRepository {
  async CreateHostel(data){
    try {
      const hostel = await Hostel.create(data);
      return hostel;
    } catch (err) {
      const fieldName = err.message.match(/dup key: \{ (\w+):/)[1];
      const errorMessage = `${fieldName} already exists`;
      throw new internalException(
        errorMessage
      );
    }
  }

  async FindHostelById(id){
    try {
      const hostel = await Hostel.findById(id);
      return hostel;
    } catch (error) {
      throw new internalException(
        en.hostel_find_server_error
      );
    }
  }

  async FindAll(){
    try {
      const hostels = await Hostel.find({});
      return hostels;
    
    } catch (error) {
      console.log(error);
      throw new internalException(
        en.hostel_find_server_error
      );
    }

  }

  async UpdateOne({id, updateData}){
    try {
      const hostel = await Hostel.findByIdAndUpdate(id, updateData, {new: true});
      return hostel;
        
    } catch (error) {
      throw new internalException(
        en.hostel_not_found
      );
    }
  }

  async FilterHostels({data}){
      
    try {
      const hostels = await Hostel.find(data).sort({createdAt: -1});
      return hostels;
    
    } catch (error) {
      throw new internalException(
        en.hostel_find_server_error
      );
    }

  }

}

module.exports = HostelRepository;