import bcrypt from "bcryptjs";
import { config } from "dotenv";
import { connectDB } from "../lib/db.js";
import User from "../models/user.model.js";

config();

const seedUsers = [
  // Female Users
  {
    email: "kavya@gmail.com",
    fullName: "Kavya Sharma",
    password: "123456",
    profilePic: "https://randomuser.me/api/portraits/women/1.jpg",
  },
  {
    email: "aishwarya@gmail.com",
    fullName: "Aishwarya Nair",
    password: "123456",
    profilePic: "https://randomuser.me/api/portraits/women/2.jpg",
  },
  {
    email: "sara@gmail.com",
    fullName: "Sara Verma",
    password: "123456",
    profilePic: "https://randomuser.me/api/portraits/women/3.jpg",
  },
  {
    email: "isha@gmail.com",
    fullName: "Isha Gupta",
    password: "123456",
    profilePic: "https://randomuser.me/api/portraits/women/4.jpg",
  },
  {
    email: "maya@gmail.com",
    fullName: "Maya Nair",
    password: "123456",
    profilePic: "https://randomuser.me/api/portraits/women/5.jpg",
  },
  {
    email: "sneha@gmail.com",
    fullName: "Sneha Aggarwal",
    password: "123456",
    profilePic: "https://randomuser.me/api/portraits/women/8.jpg",
  },

  // Male Users
  {
    email: "pawandev@gmail.com",
    fullName: "Pawandev Kumar",
    password: "123456", 
    profilePic: "https://randomuser.me/api/portraits/men/3.jpg",
  },
  {
    email: "dev@gmail.com",
    fullName: "Dev Yadav",
    password: "123456",
    profilePic: "https://randomuser.me/api/portraits/men/62.jpg",
  },
  {
    email: "harsh@gmail.com",
    fullName: "Harsh Deo",
    password: "123456",
    profilePic: "https://randomuser.me/api/portraits/men/22.jpg",
  },
  {
    email: "rahul@gmail.com",
    fullName: "Rahul Kumar",
    password: "123456",
    profilePic: "https://randomuser.me/api/portraits/men/4.jpg",
  },
  {
    email: "sreeram@gmail.com",
    fullName: "Sreeram Prasad",
    password: "123456",
    profilePic: "https://randomuser.me/api/portraits/men/5.jpg",
  },
  {
    email: "akshit@gmail.com",
    fullName: "Akshit Aggarwal",
    password: "123456",
    profilePic: "https://randomuser.me/api/portraits/men/6.jpg",
  },
  {
    email: "kabir@gmail.com",
    fullName: "Kabir Hooda",
    password: "123456",
    profilePic: "https://randomuser.me/api/portraits/men/7.jpg",
  },
  {
    email: "kedar@gmail.com",
    fullName: "Kedar Sharma",
    password: "123456",
    profilePic: "https://randomuser.me/api/portraits/men/8.jpg",
  },
  {
    email: "priyanshu@gmail.com",
    fullName: "Priyanshu Ranjan",
    password: "123456",
    profilePic: "https://randomuser.me/api/portraits/men/9.jpg",
  },
];

// Hash passwords
seedUsers.forEach(user => {
  user.password = bcrypt.hashSync(user.password, 10);
});
const seedDatabase = async () => {
  try {
    await connectDB();
    // console.log("Database connected successfully");

    await User.deleteMany(); // Clear existing users
    await User.insertMany(seedUsers);
    console.log("Database seeded successfully");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
};

// Call the function
seedDatabase();
