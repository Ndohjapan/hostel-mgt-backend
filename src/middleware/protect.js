const en = require("../../locale/en");
const AuthException = require("../error/auth-exception");
const jwt = require("jsonwebtoken");
const { AuthService } = require("../service/auth-service");
const jwtConfig = require("config").get("jwt");

const service = new AuthService();

const porterAuth = async(req, res, next) => {
  let token = req.headers["x-access-token"];

  if (!token) {
    return next(new AuthException(en.authentication_failure));
  }
  
  jwt.verify(token, jwtConfig.publicKey, async(err, decoded) => {
    
    if (err) {
      return next(new AuthException(en.authentication_failure));
    }

    let user = await service.FindPorterById(decoded.id);

    if(!user){
      return next(new AuthException(en.authentication_failure));
    }

    req.user = user;

    return next(); 
  });

};


module.exports = {porterAuth};