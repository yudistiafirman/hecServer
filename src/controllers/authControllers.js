const query = require("../config/connection");
const bcrypt = require("bcrypt");
const saltRounds = 10;

const getUsers = async (req, res) => {
  try {
    const users = await query("select * from users");
    res.status(200).send({
      success: true,
      message: "successfully get users data",
      data: users,
    });
  } catch (error) {
    console.log(error, "======== error getting data users");
    res.status(500).send({
      success: false,
      message: "something went wrong",
    });
  }
};

const registerUsers = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    await query(
      "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
      [username, email, hashedPassword]
    );
    console.log("new user registered ===========");
    res.send("You have successfully registered");
  } catch (error) {
    console.error(error, "error inserting new users ========");
    res
      .status(500)
      .send("An error occurred while registering. Please try again later.");
  }
};

const loginUsers = async (req, res) => {
  try {
    const { email, password } = req.body;
    const userData = await query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    if (userData.length === 0) {
      res.status(401).send({
        success: false,
        message: "invalid email or password",
      });
    } else {
      const user = userData[0];
      const passwordsMatch = await bcrypt.compare(password, user.password);
      if (passwordsMatch) {
        console.log("User logged in:", user.username);
        res.send({
          success: true,
          data: {
            username: user.username,
            email: user.email,
          },
          message: "You have successfully log in",
        });
      } else {
        res.status(401).send({
          success: false,
          message: "invalid email or password",
        });
      }
    }
  } catch (error) {
    console.error(error, "Error Retrieving users ========");
    res.status(500).send({
      success: false,
      message: "An error occured while log in ",
    });
  }
};

module.exports = {
  getUsers,
  registerUsers,
  loginUsers,
};
