import express from "express";
// import formidable from "express-formidable";

const router = express.Router();
const multer = require("multer");
const path = require("path");

//middleware
import { requireSignin, canEditDeletePost } from "../middlewares";
//controllers
import {
  createPost,
  //uploadImage,
  // postsByUser,
  editPost,
  updatePost,
  deletePost,
  newsFeed,
  likePost,
  unlikePost,
  addComment,
  removeComment,
  postCount
} from "../controllers/post";

router.post("/create-post", requireSignin, createPost);
// router.get("/user-posts", requireSignin, postsByUser);
router.get("/edit-post/:slug_id", requireSignin, editPost);
router.put(
  "/update-post/:slug_id",
  requireSignin,
  canEditDeletePost,
  updatePost
);
router.delete(
  "/delete-post/:slug_id",
  requireSignin,
  canEditDeletePost,
  deletePost
);

//Image upload using cloudinary
// router.post(
//   "/upload-image",
//   requireSignin,
//   formidable({ maxFileSize: 5 * 1024 * 1024 }),
//   uploadImage
// );

router.get("/news-feed/:page", requireSignin, newsFeed);
router.put("/like-post", requireSignin, likePost);
router.put("/unlike-post", requireSignin, unlikePost);
router.put("/add-comment", requireSignin, addComment);
router.put("/remove-comment", requireSignin, removeComment);
router.get("/post-count", postCount)

//Image upload using multer
const storage = multer.diskStorage({
  destination: "./public/uploads/",
  filename: function (req, file, cb) {
    cb(null, "IMAGE-" + Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 1000000 },
});

router.post(
  "/upload-image",
  requireSignin,
  upload.single("image"),
  (req, res) => {
    try {
      res.json({ success: "Image uploaded successfully" });
    } catch (err) {
      console.log(err);
    }
  }
);

module.exports = router;
