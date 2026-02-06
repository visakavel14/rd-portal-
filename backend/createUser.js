const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("./models/User");

const MONGO_URI = "mongodb://localhost:27017/portal";

mongoose.connect(MONGO_URI).then(async () => {
  console.log("MongoDB connected");

  const adminExists = await User.findOne({ username: "admin" });
  if (!adminExists) {
    const hashed = await bcrypt.hash("admin123", 10);
    await User.create({ username: "admin", password: hashed, role: "admin" });
    console.log("Admin user created");
  }

  const facultyExists = await User.findOne({ username: "faculty1" });
  if (!facultyExists) {
    const hashed = await bcrypt.hash("faculty123", 10);
    await User.create({ username: "faculty1", password: hashed, role: "faculty" });
    console.log("Faculty user created");
  }

  mongoose.connection.close();
});
