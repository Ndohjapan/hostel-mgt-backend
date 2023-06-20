const PorterRepository = require("../database/repository/porter-repository");
const AuthException = require("../error/auth-exception");
const en = require("../../locale/en");
const NotFoundException = require("../error/not-found-exception");


class AuthService{
  constructor(){
    this.repository = new PorterRepository();   
  }

  async PorterSignIn(porterInput){
    const {email, password} = porterInput;
    try {
      const existingPorter = await this.repository.FindPorterByEmail({email});

      if(existingPorter){
        const passwordCheck = await this.repository.validatePassword({porter: existingPorter, password});


        if(passwordCheck){
          existingPorter.password = undefined;
          return existingPorter;
        }
      }

      throw new AuthException(en.login_failure);
      
    } catch (error) {
      throw new AuthException(en.login_failure);
    }
  }

  async FindPorterById(id){
    try {
      const porter = await this.repository.FindPorterById(id);
  
      return porter;
        
    } catch (error) {
      throw new NotFoundException(en.porter_not_found);
    }
  }
}

module.exports = {AuthService};