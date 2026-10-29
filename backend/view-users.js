const mongoose = require("mongoose");
const User = require("./models/User");

// Connect to MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/bookstore")
  .then(async () => {
    console.log("-----------------------------------------");
    console.log("📚 REGISTERED USERS IN DATABASE");
    console.log("-----------------------------------------");
    
    // Fetch all users
    const users = await User.find({}, "-password"); // Exclude password hashes for safety
    
    if (users.length === 0) {
      console.log("No users found! Nobody has registered yet.");
    } else {
      users.forEach((user, index) => {
        console.log(`\nUser #${index + 1}:`);
        console.log(`  Name:    ${user.name}`);
        console.log(`  Email:   ${user.email}`);
        console.log(`  Role:    ${user.role}`);
        if(user.college) console.log(`  College: ${user.college}`);
        console.log(`  Joined:  ${user.createdAt.toLocaleString()}`);
      });
    }
    
    console.log("\n-----------------------------------------");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Error connecting to DB:", err);
    process.exit(1);
  });
