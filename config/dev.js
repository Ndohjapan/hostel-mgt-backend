/* eslint-disable no-undef */
require("dotenv").config();
module.exports = {
  database: {
    URL: "mongodb://127.0.0.1:27017/hostel-mgt-dev"
  },

  session: {
    secret: "238hu3nuW@D@WWFEW1j32n@1"
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
