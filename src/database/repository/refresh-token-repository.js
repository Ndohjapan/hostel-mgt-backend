const en = require("../../../locale/en");
const internalException = require("../../error/internal-exception");
const { RefreshToken } = require("../model");
const moment = require("moment");

class RefreshTokenRepository {
  async SaveRefreshToken(userId, token, device){
    try {
      const expirationDate = moment().add(120, "days").toDate();
      const refreshToken = await RefreshToken.create({ userId, token, device, expires: expirationDate });
      return refreshToken;
    } catch (err) {
      throw new internalException(
        en.token_server_error
      );
    }
  }

  async DeleteRefreshToken(token){
    try {
      await RefreshToken.deleteOne(token);
      return;
    } catch (error) {
      throw new internalException(
        en.token_delete_error
      );
    }
  }

  async FindTokenByToken(token){
    try {
      const refreshToken = await RefreshToken.findOne(token);
      return refreshToken;
    } catch (error) {
      throw new internalException(
        en.token_server_error
      );
    }
  }

  async IsExpired(token){
    try {
      const response = await token.isExpired();
      return response;
    } catch (error) {
      throw new internalException(
        en.token_server_error
      );
        
    }
  }
  
}

module.exports = RefreshTokenRepository;