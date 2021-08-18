const express = require("express");
// import bcrypt  to hash the password
const bcrypt = require("bcrypt");
//import jwt to login process
const jwt = require("jsonwebtoken");
// import user model
const User = require("../models/users");
//create an express router
const router = express.Router();
// import multer to manage the image file of the user
const multer = require("multer");
// import the atuh middleware
const checkAuth = require("../middleware/check-auth");
// import cors libraries
const cors = require("cors");

// MIME_TYPE_MAP define the allowed types of file img
const MIME_TYPE_MAP = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
};

// create storage variable to define where multer put the files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // create a validation for file extention
    // returns null if the file extention isn't in the allowed exentions array defined by MIME_TYPE_MAP variables
    const isValid = MIME_TYPE_MAP[file.mimetype];
    let error = new Error("invalid mime type");
    if (isValid) {
      error = null;
    }
    // the callback function receives the following arguments:
    // first argument is the action whether you detected some error
    // second argumet is the relative path of the folder where you want to storage the files
    cb(error, "backend/images");
  },
  filename: (req, file, cb) => {
    // get the file name and replaces de blank spaces ' ' with '-'
    const name = file.originalname.toLocaleLowerCase().split(" ").join("-");
    // get the allowed extentions
    const ext = MIME_TYPE_MAP[file.mimetype];
    // create a path with a timestamp and the file extention
    //first parameter is the action to do
    //second parameter is the path for the new file saved
    cb(null, name + "-" + Date.now() + "." + ext);
  },
});

// enable pre-flight request for post request
// app.options("/signup", cors());
// create a signup route to stored a new user in the db
router.post("/signup", cors(), (req, res, next) => {
  // create a new user element from user model
  // hasing the password with a complexity(rounds) of 10 ramdom numbers
  // this method (hash) returns a promise with the password hashed as result
  bcrypt.hash(req.body.user_password, 10).then((hash) => {
    const user = new User({
      user_name: req.body.user_name,
      user_last_name: req.body.user_last_name,
      user_email: req.body.user_email,
      user_role: req.body.user_role,
      user_password: hash,
      user_photo: "",
      user_intro: "",
    });

    // save the user into the db and inform the result
    user
      .save()
      .then((result) => {
        //   return to the user the 201 code to inform the user created event
        res.status(201).json({
          message: "the user was created successfully!",
          result: result,
        });
      })
      .catch((err) => {
        res.status(500).json({
          message: "an error has occured during the saving process",
          error: err,
        });
      });
  });
});

router.post("/login", cors(), (req, res, next) => {
  let fetchedUser;
  // find the unique user by email prop
  // returns a pormise with the search result
  User.findOne({ user_email: req.body.user_email }).then((singleUser) => {
    if (!singleUser) {
      return res.status(401).json({
        message:
          "Authentication failed! for the following reason : 'user not found'",
      });
    }
    //   if the user exist is saved in fetchedUser variable
    fetchedUser = singleUser;
    // use bcrypt to compare the input password and saved password
    // return a promise where the result is a boolean , if the passwords match it will be true else it will be false
    bcrypt
      .compare(req.body.user_password, singleUser.user_password)
      .then((result) => {
        // is match doesn't exits
        if (!result) {
          res.status(401).json({
            message:
              "Authentication failed! for the following reason : 'Credentials no matched'",
          });
        }
        //   is match exist a new jwt will be created with the sign method
        //   the sign method provide us a new jwt , the first parameter is the data that we want to pass it as json object
        //   the second parameter is a secret string , it will be used to get access in the jwt
        //   the third parameter is an object that wrap the expiresIn property for token , it will be a string and represent the time that token keep valid for the user upon expire it

        const token = jwt.sign(
          {
            user_email: fetchedUser.user_email,
            userId: fetchedUser._id,
          },
          "secret_string_must_to_be_longer",
          {
            expiresIn: "2h",
          }
        );
        //   is everything is ok pass the token to the frontend
        return res.status(200).json({
          token: token,
          expiresIn: 7200,
          userId: fetchedUser._id,
          user_role: fetchedUser.user_role,
        });
      })
      //   if any error exist during the authentication process, an 500 state error is returned
      .catch((err) => {
        return res.status(500).json({
          message:
            "Authentication failed! for the following reason : 'user not found'",
        });
      });
  });
});

// update user photo
// app.options("/updatePic", cors());
router.put(
  "/updatePic",
  cors(),
  checkAuth,
  multer({ storage: storage }).single("image"),
  (req, res, next) => {
    console.log(req.userData.userId);
    // create an url to the image file
    const url = req.protocol + "://" + req.get("host");
    imagePath = url + "/images/" + req.file.filename;

    const userPicUpdated = new User({
      user_photo: imagePath,
      _id: req.userData.userId,
    });

    User.updateOne({ _id: req.userData.userId }, userPicUpdated).then(
      (result) => {
        if (result.n > 0) {
          res
            .status(200)
            .json({ message: "User Photo has been updated successfuly!" });
        } else {
          res.status(401).json({ message: "Not authorized!" });
        }
      }
    );
  }
);
// update user banner
// app.options("/updateBanner", cors());
router.put(
  "/updateBanner",
  cors(),
  checkAuth,
  multer({ storage: storage }).single("banner"),
  (req, res, next) => {
    console.log(req.userData.userId);
    // create an url to the image file
    const url = req.protocol + "://" + req.get("host");
    imagePath = url + "/images/" + req.file.filename;

    const userPicUpdated = new User({
      user_banner: imagePath,
      _id: req.userData.userId,
    });

    User.updateOne({ _id: req.userData.userId }, userPicUpdated).then(
      (result) => {
        if (result.n > 0) {
          res
            .status(200)
            .json({ message: "The banner has been updated successfuly!" });
        } else {
          res.status(401).json({ message: "Not authorized!" });
        }
      }
    );
  }
);
//update basic information
// app.options("/updateBasicData", cors());
router.put("/updateBasicData", cors(), checkAuth, (req, res, next) => {
  console.log(req.body);
  const newData = new User({
    _id: req.userData.userId,
    user_name: req.body.user_name,
    user_last_name: req.body.user_last_name,
    user_intro: req.body.user_intro,
  });

  User.updateOne({ _id: req.userData.userId }, newData).then((result) => {
    if (result.n > 0) {
      res
        .status(200)
        .json({ message: "The user basic data has been updated successfuly!" });
    } else {
      res.status(401).json({ message: "Not authorized!" });
    }
  });
});
//obtain the data oof a single user by _id
// app.options("/singleUser", cors());

router.get("/singleUser", cors(), checkAuth, (req, res, next) => {
  User.findOne({ _id: req.userData.userId })
    .then((singleUser) => {
      let userData = {
        user_name: singleUser.user_name,
        user_last_name: singleUser.user_last_name,
        user_photo: singleUser.user_photo,
        user_intro: singleUser.user_intro,
        user_email: singleUser.user_email,
        user_banner: singleUser.user_banner,
      };
      res.status(200).json({ userData: userData });
    })
    .catch((err) => {
      res.status(404).json({ message: "An error has occurred", err });
    });
});

module.exports = router;
