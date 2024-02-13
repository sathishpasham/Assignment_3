const mongoose = require("mongoose");

const connectdb = () => {
  mongoose
    .connect(
      "mongodb+srv://bhushandb:mongodbconnected@cluster0.vg7lt.mongodb.net/?retryWrites=true&w=majority",
      {
        dbName: "assignment",
      }
    )
    .then((c) => console.log(`Database connected`))
    .catch((e) => console.log(e));
};

module.exports = { connectdb };
