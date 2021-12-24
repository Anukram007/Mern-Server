import express from "express";

const router = express.Router();

import {
  register,
  login,
  currentUser,
  forgotPassword,
  updateProfile,
  findPeople,
  addFollower,
  userFollowing,
  followingUser,
  removeFollower,
  userUnfollowing,
  searchUser,
  getUser
} from "../controllers/auth";
import { requireSignin } from "../middlewares";

router.post("/register", register);
router.post("/login", login);
router.get("/current-user", requireSignin, currentUser);
router.post("/forgot-password", forgotPassword);
router.put("/update-profile", requireSignin, updateProfile);
router.get("/find-people", requireSignin, findPeople);
router.put("/follow-user", requireSignin, addFollower, userFollowing);
router.get("/following-user", requireSignin, followingUser);
router.put("/unfollow-user", requireSignin, removeFollower, userUnfollowing);
router.get("/search-user/:name", searchUser);
router.get("/user/:username", getUser);
module.exports = router;
