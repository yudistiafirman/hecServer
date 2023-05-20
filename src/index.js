const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const userRoute = require("./routes/authRoute");
const jobRoute = require("./routes/jobRoute");
const trainingRoute = require("./routes/trainingRoute");

const app = express();

app.use(express.json());
app.use(morgan("combined"));
app.use(cors());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});
app.use("/uploads", express.static("uploads"));
app.use("/auth", userRoute);
app.use("/job", jobRoute);
app.use("/training", trainingRoute);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
