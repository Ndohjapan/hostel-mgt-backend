// connect to database
// delete tokens
// start application

const app = require("./src/app");
const { connectToDatabase } = require("./src/database/connection");
const { consumePayments } = require("./src/util/rabbitmq-consumer");
require("dotenv").config();

// eslint-disable-next-line no-undef
const PORT = process.env.PORT || 7002;

// Connect to database
connectToDatabase();
consumePayments();

app.listen(PORT, async () => {
  console.log("Server is running on port " + PORT);
});
