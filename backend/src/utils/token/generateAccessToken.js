import jwt from "jsonwebtoken";

const generateAccessToken = (userId) => {

  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );

};

export default generateAccessToken;