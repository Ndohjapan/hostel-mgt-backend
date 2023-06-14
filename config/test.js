/* eslint-disable no-undef */
require("dotenv").config();
module.exports = {
  database: {
    URL: `mongodb://127.0.0.1:27017/test_${new Date().getTime()}`
  },

  session: {
    secret: "ji291812m92hwe2QAA2@ew!jewufiw0+302-jfjD$!@1d"
  },
  
  jwt: {
    publicKey: process.env.JWT_PUBLIC_KEY,
    privateKey: process.env.JWT_PRIVATE_KEY
  },
  
  rabbitmq: {
    url: "amqp://localhost",
    exchangeName: "schoolExchange"
  }
};