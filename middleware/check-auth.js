const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  // get the active token from the headers request and split it by space " " in order to get access to the user token
  // the common form to the user token is the folloing ('Bearer ty7d7asdbvasdadsA12321')
  // where the Bearer word is used as standar to recognize the token after it
  try {
    const token = req.headers.authorization.split(" ")[1];

    //use verify method to check is the current token is valid, we need to pass it the token as a first parameter
    // as second parameter we need to pass the secre string used prveously to create the token
    const decodedToken = jwt.verify(token, "secret_string_must_to_be_longer");
    // if the verification goes ok let the user to continue the request

    // pass the user data fetched form the token to the next middleware
    req.userData = {
      user_email: decodedToken.user_email,
      userId: decodedToken.userId,
    };
    next();
  } catch (error) {
    res.status(401).json({
      message: "Invalid token: auth failed!",
    });
  }
};
