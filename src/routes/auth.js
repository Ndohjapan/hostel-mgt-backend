const { validatePorterLoginInput} = require("../middleware/auth-input-validator");
const { TokenService } = require("../service/token-service");
const { AuthService } = require("../service/auth-service");
const catchAsync = require("../util/catch-async");

module.exports = async(app) => {
  const service = new AuthService();
  const tokenService = new TokenService();

  app.post("/api/1.0/auth", validatePorterLoginInput, catchAsync(async(req, res) => {
    const {email, password} = req.body;

    const porter = await service.PorterSignIn({email, password});

    const deviceInfo = await tokenService.GetDeviceInfoFromHeaders(req.headers);

    const tokens = await tokenService.GenerateTokens(porter._id, deviceInfo);

    res.send({porter, tokens});
    
  }));

  app.post("/api/1.0/auth/token", catchAsync(async(req, res) => {
    const {token} = req.body;

    const userId = await tokenService.VerifyRefreshToken(token);

    const deviceInfo = await tokenService.GetDeviceInfoFromHeaders(req.headers);

    const tokens = await tokenService.GenerateTokens(userId, deviceInfo);

    res.send({tokens});
  }));

  // eslint-disable-next-line no-unused-vars
  app.post("/api/1.0/logout", catchAsync(async(req, res) => {
    let refreshToken = req.headers["x-access-token"];
    if(refreshToken){
      await tokenService.DeleteRefreshToken(refreshToken);
    }
    
    res.status(204).send();
  }));
  
};
