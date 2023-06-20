const RefreshTokenRepository = require("../database/repository/refresh-token-repository");
const en = require("../../locale/en");
const NotFoundException = require("../error/not-found-exception");
const jwt = require("jsonwebtoken");
const jwtConfig = require("config").get("jwt");
const UAParser = require("ua-parser-js");
const AuthException = require("../error/auth-exception");


class TokenService{
  constructor(){
    this.repository = new RefreshTokenRepository();      
  }

  async GenerateTokens(userId, deviceInfo){
    try {

      const id = userId;

      const expiresIn = "1d";
      const refreshTokenExpiresIn = "120d";
        
      const payload = {
        id,
        iat: Date.now()
      };

      const signedToken = jwt.sign(payload, jwtConfig.privateKey, { expiresIn: expiresIn, algorithm: "RS256" });

      const refreshToken = jwt.sign(payload, jwtConfig.privateKey, { expiresIn: refreshTokenExpiresIn, algorithm: "RS256"});

      await this.repository.SaveRefreshToken(id, refreshToken, deviceInfo);

      return {accessToken: signedToken, refreshToken};
      
    } catch (error) {
      throw new NotFoundException(en.token_server_error);
    }
  }

  async GetDeviceInfoFromHeaders(headers) {
    try {
        
      const userAgentString = headers["user-agent"];
      const parser = new UAParser();
      const result = parser.setUA(userAgentString).getResult();
      
      const deviceInfo = {
        model: result.device?.model,
        os: result.os.name + " " + result.os.version,
        architecture: result.cpu.architecture,
        browser: result.browser.name,
        browserVersion: result.browser.version
      };
      
      return deviceInfo;
    } catch (error) {
      throw new NotFoundException(en.header_server_error);
    }
  }

  async DeleteRefreshToken(token){
    await this.repository.DeleteRefreshToken({token});
    return;
  }

  async VerifyRefreshToken(token){
    if (token == null) {
      throw new AuthException(en.refresh_token_error);
    }
    
    let refreshToken = await this.repository.FindTokenByToken({token});
    if (!refreshToken) {
      throw new AuthException(en.refresh_token_error);        
    }
    const isExpired = await this.repository.IsExpired(refreshToken);
    if (isExpired) {
      await this.DeleteRefreshToken(token);
      throw new AuthException(en.refresh_token_error);                  
    }

    return refreshToken.userId;
  }

}

module.exports = {TokenService};