const express = require("express");
const cors = require("cors");
const hpp = require("hpp");
const xss = require("xss-clean");
const { interceptorParam } = require("./middleware/logger");
require("dotenv").config();

const { auth, user, hostel, room } = require("./routes");
const errorHandler = require("./error/error-handler");
const NotFoundException = require("./error/not-found-exception");
const en = require("../locale/en");

const app = express();

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// eslint-disable-next-line no-undef
if (process.env.NODE_ENV !== "test") {
  app.use(interceptorParam);
}


const corsOptions = {
  origin: function (origin, callback) {
    callback(null, true);
  }
};

app.use(cors(corsOptions));
app.use(hpp());
app.use(xss());

auth(app);
user(app);
hostel(app);
room(app);

app.use((req, res, next) => {
  next(new NotFoundException(en.page_not_found));
});

app.use(errorHandler);

module.exports = app;