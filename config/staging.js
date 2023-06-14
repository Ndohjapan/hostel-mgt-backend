/* eslint-disable no-undef */
require("dotenv").config();
module.exports = {
  database: {
    URL: process.env.DB_URL
  },

  session: {
    secret: process.env.SESSION_KEY
  },

  jwt: {
    publicKey: process.env.JWT_PUBLIC_KEY,
    privateKey: process.env.JWT_PRIVATE_KEY
  },
  
  rabbitmq: {
    url: process.env.RABBITMQ_URL,
    exchangeName: process.env.RABBITMQ_EXCHANGE
  }
};
