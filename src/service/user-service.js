const UserRepository = require("../database/repository/user-repository");
const en = require("../../locale/en");
const NotFoundException = require("../error/not-found-exception");

class UserService {
  constructor() {
    this.repository = new UserRepository();
  }

  async CreateUser(userPayment) {
    try {
      const filter = { userId: userPayment.userId };
      const percentage =
        (userPayment.hostel.amountPaid / userPayment.hostel.amount) * 100;
      const update = {
        userId: userPayment.userId._id,
        firstname: userPayment.userId.firstname,
        lastname: userPayment.userId.lastname,
        middlename: userPayment.userId.middlename,
        avatar: userPayment.userId.avatar,
        faculty: userPayment.userId.faculty,
        department: userPayment.userId.department,
        level: userPayment.userId.level,
        amountPaid: userPayment.hostel.amountPaid,
        totalAmount: userPayment.hostel.amount,
        percentage,
        matricNumber: userPayment.userId.matricNumber
      };

      const user = await this.repository.CreateUser(filter, update);

      return user;
    } catch (error) {
      throw new NotFoundException(en.user_not_found);
    }
  }

  async FindById(id){
    try {
      const user = await this.repository.FindUserById(id);

      return user;
      
    } catch (error) {
      throw new NotFoundException(en.user_not_found);
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

  async FilterUsers({page, limit, data}){
    let updateData = {};

    Object.entries(data).forEach(([key, value]) => {
      if (value != "") {
        updateData[key] = value;
      }
    });

    try {
      const users = await this.repository.FilterUsers({page, limit, data});
      return users;
    } catch (error) {
      throw new NotFoundException();
    }
  }
}

module.exports = { UserService };
