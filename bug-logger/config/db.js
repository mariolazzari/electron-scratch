const mongoose = require("mongoose");

// connection options
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

// cpnnect db
const connectdb = async () => {
  try {
    await mongoose.connect("mongodb://localhost:27017/bugLogger", options);
    console.log("MongoDB succesfully connected.");
  } catch (ex) {
    console.error(ex);
    process.exit(1);
  }
};

module.exports = connectdb;
