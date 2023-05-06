const query = require("../config/connection");

const postJobs = async (req, res) => {
  try {
    console.log(req.imagePath);
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  postJobs,
};
