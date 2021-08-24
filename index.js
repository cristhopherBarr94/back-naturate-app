// import cors to set headers easily
const cors = require("cors");
//import express framework
const express = require("express");
// import path tool to create a new path for accesibility in request
const path = require("path");
// import mongoose to connect with mongo database
const mongoose = require("mongoose");
// create express app
const app = express();

// import body-parser package to storage the data from user request
// const bodyParser = require("body-parser");

// import user route
const userRoutes = require("./routes/users");
// import user route
const postsRoutes = require("./routes/posts");
// create vriable to connect Mongodb from heroku
const uri = process.env.MONGODB_URI;

// connect with mongodb
// user criss
// password: vYZstQVVRAJarRiI
// 200.118.62.30 ip db
mongoose
  .connect(
    // "mongodb+srv://criss:vYZstQVVRAJarRiI@cluster0.rkmlt.mongodb.net/crudOperations",
    uri,
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => {
    console.log("Connected to database!");
  })
  .catch(() => {
    console.error("connection failed!");
  });
// handle error
mongoose.connection.on("error", (err) => {
  console.error(err);
});

// set the images folder as public ir order to allow the clients fetch data
app.use("/images", express.static(path.join("./images")));

// boody parser configuration
// set max size limit for request
app.use(express.json({ limit: 52428800 }));
app.use(express.urlencoded({ limit: 52428800 }));

// implement cors middleware
app.use(
  cors({
    origin: "*",
    allowedHeaders: [
      "Origin",
      "X-Requested-With",
      "Content-Type",
      "Accept",
      "Authorization",
    ],
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    preflightContinue: true,
  })
);
app.options("*", cors());

// app.use((req, res, next) => {
//   // enable * (any domain) to get access to resorces
//   res.setHeader("Access-Control-Allow-Origin", "*");
//   //add some extra headers
//   res.setHeader(
//     "Access-Control-Allow-Headers",
//     "Origin, X-Requested-With, Content-Type, Accept, Authorization"
//   );
//   res.setHeader("Access-Control-Allow-Credentials", true);
//   // add the http metohds allowed
//   res.setHeader(
//     "Access-Control-Allow-Methods",
//     "GET, POST, PATCH, PUT, DELETE, OPTIONS"
//   );
//   // operator that allow us to pass to the next middleware
//   next();
// });

app.use("/api/users", userRoutes);
app.use("/api/posts", postsRoutes);

// export the app
module.exports = app;
