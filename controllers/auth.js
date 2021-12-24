import { hashPassword, comparePassword } from "../helpers/auth";
import User from "../models/user";
import jwt from "jsonwebtoken";
import { nanoid } from "nanoid";

const { JWT_SECRET } = process.env;

export const register = async (req, res) => {
  const { name, email, password, secret } = req.body;
  //validation
  if (!name) {
    return res.json({
      error: "Name is required",
    });
  }
  if (!password || password.length < 6) {
    return res.json({
      error: "Password is required and must be more than 6 character",
    });
  }
  if (!secret) {
    return res.json({
      error: "Please type your secret answer",
    });
  }
  const exist = await User.findOne({ email });
  if (exist) {
    return res.json({
      error: "Email id already exist",
    });
  }
  //hash password
  const hashedPassword = await hashPassword(password);

  const user = new User({
    name,
    email,
    password: hashedPassword,
    secret,
    username: nanoid(6),
  });
  try {
    await user.save();
    // console.log(user, "USER REGISTERED");
    return res.json({
      success: "User successfully registerd and inserted into db",
    });
  } catch (err) {
    // console.log(err, "USER REGISTRATION FAILED");
    return res.status(400).send("Error! something went wrong.");
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    //check user registered or not
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({
        error: "User not registered.",
      });
    }
    //check password matched
    const match = await comparePassword(password, user.password);
    if (!match) {
      return res.json({
        error: "Email id or password doesn't match",
      });
    }
    //create token for authentication
    const token = jwt.sign({ _id: user.id }, JWT_SECRET, {
      expiresIn: "7d",
    });
    user.password = undefined;
    user.secret = undefined;
    res.status(200).json({ token, user });
  } catch (err) {
    return res.status(400).send("Sorry! something went wrong.");
  }
};

export const currentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    // res.json(user);
    res.json({ ok: true });
  } catch (err) {
    console.log(err);
    res.sendStatus(400);
  }
};

export const forgotPassword = async (req, res) => {
  // console.log(req.body);
  const { email, newPassword, secret } = req.body;
  //validation
  if (!newPassword || newPassword.length < 6) {
    return res.json({
      error: "New password required and should be minimum 6 characters long",
    });
  }
  if (!secret) {
    return res.json({
      error: "Secret is required",
    });
  }
  const user = await User.findOne({ email, secret });
  if (!user) {
    return res.json({
      error: "We can't verify you with those details",
    });
  }

  try {
    const hashed = await hashPassword(newPassword);
    await User.findByIdAndUpdate(user._id, { password: hashed });
    return res.json({
      success: "Congrats, you can now login with your new password",
    });
  } catch (err) {
    return res.json({
      error: "Sorry! something went wrong",
    });
  }
};

export const updateProfile = async (req, res) => {
  const { username } = req.body;
  try {
    const data = {};
    const exist = await User.findOne({ username });
    if (exist) {
      return res.json({
        error: "Username already taken.",
      });
    } else if (req.body.username) {
      data.username = req.body.username;
    }
    if (req.body.about) {
      data.about = req.body.about;
    }
    if (req.body.name) {
      data.name = req.body.name;
    }
    if (req.body.password) {
      if (req.body.password.length < 6) {
        return res.json({
          error: "Password must be more than 6 character long",
        });
      } else {
        data.password = await hashPassword(req.body.password);
      }
    }
    if (req.body.secret) {
      data.secret = req.body.secret;
    }
    if (req.body.image) {
      data.image = req.body.image;
    }

    let user = await User.findByIdAndUpdate(req.user._id, data, { new: true });
    user.password = undefined;
    user.secret = undefined;
    res.json({
      success: "Profile updated successfully",
      user,
    });
  } catch (err) {
    if (err.code == 1100) {
      res.json({ error: "Username already taken." });
    }
    console.log(err);
  }
};

export const findPeople = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    // User Folowing
    let following = user.following;
    following.push(user._id);
    // Follow Suggestions
    const people = await User.find({ _id: { $nin: following } })
      .select("-password -secret")
      .limit(10);
    res.json(people);
  } catch (err) {
    console.log(err);
  }
};

// Middleware
export const addFollower = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.body._id, {
      $addToSet: { followers: req.user._id },
    });
    next();
  } catch (err) {
    console.log(err);
  }
};

export const userFollowing = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        $addToSet: { following: req.body._id },
      },
      { new: true }
    ).select("-password -secret");
    res.json(user);
  } catch (err) {
    console.log(err);
  }
};
export const followingUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const following = await User.find({ _id: user.following }).limit(50);
    res.json(following);
  } catch (err) {
    console.log(err);
  }
};

//Middleware
export const removeFollower = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.body._id, {
      $pull: { followers: req.user._id },
    });
    next();
  } catch (err) {
    console.log(err);
  }
};

export const userUnfollowing = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        $pull: { following: req.body._id },
      },
      { new: true }
    ).select("-password -secret");
    res.json(user);
  } catch (err) {
    console.log(err);
  }
};

export const searchUser = async (req, res) => {
  const { name } = req.params;
  if (!name) return;
  try {
    const user = await User.find({
      $or: [
        { name: { $regex: name, $options: "i" } },
        { username: { $regex: name, $options: "i" } },
      ],
    }).select("-password -secret");
    res.json(user);
  } catch (err) {
    console.log(err);
  }
};

export const getUser = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username }).select(
      "-password -secret"
    );
    res.json(user)
  } catch (err) {
    console.log(err);
  }
};
