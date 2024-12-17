import express from "express";
import { checkAuth, login, logout, signup, updateProfile } from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

router.put("/update-profile", protectRoute, updateProfile); //to update profile picture

//used when page is refreshed to check if the user is still authenticated
//based on that the user will be redirected to the login page or the home page or the profile page
router.get("/check", protectRoute, checkAuth);//used to check if the user is authenticated or not

export default router;
