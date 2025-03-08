const generateToken = require("../lib/utils");
const User = require("../models/user.model");
const bcrypt = require("bcryptjs");
const cloudinary = require("../lib/cloudinary");

module.exports.signup = async (req, res) => {

  const { fullName, email, password } = req.body;

  try {

    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const user = await User.findOne({ email });

    if (user) return res.status(400).json({ message: "Email already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
    });

    if (newUser) {
      
      generateToken(newUser._id, res);
      await newUser.save();

      res.status(201).json({
        _id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        profilePic: newUser.profilePic,
      });

    } else {

      res.status(400).json({ message: "Invalid user data" });

    }

    console.log("Signup controller: User created successfully");


  } catch (error) {

    console.log("Error in signup controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });

  }
};

module.exports.login = async (req, res) => {

  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    generateToken(user._id, res);

    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
    });


  } catch (error) {

    console.log("Error in login controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });

  }
};

module.exports.logout = (req, res) => {

  try {

    res.clearCookie("jwt", {
    httpOnly: true, // prevent XSS attacks cross-site scripting attacks
    sameSite: "strict", // CSRF attacks cross-site request forgery attacks
    secure: process.env.NODE_ENV !== "development", // Secured in production
  });

    res.status(200).json({ message: "Logged out successfully" });

  } catch (error) {

    console.log("Error in logout controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });

  }

};

module.exports.updateProfile = async (req, res) => {

  try {

    const userId = req.user._id;
    const profilePic = req.file;

    if (!profilePic) {
      return res.status(400).json({ message: "Profile pic is required" });
    }

    const base64String = `data:${profilePic.mimetype};base64,` + profilePic.buffer.toString('base64');
    const uploadResponse = await cloudinary.uploader.upload(base64String);

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePic: uploadResponse.secure_url },
      { new: true }
    );

    res.status(200).json(updatedUser);
    
  } catch (error) {
    console.log("Error in update profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports.checkAuth = (req, res) => {
  try {

    res.status(200).json(req.user);
    
  } catch (error) {
    console.log("Error in checkAuth controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};