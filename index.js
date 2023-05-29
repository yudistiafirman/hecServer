const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const userRoute = require("./src/routes/authRoute");
const jobRoute = require("./src/routes/jobRoute");
const trainingRoute = require("./src/routes/trainingRoute");
const facilityRoute = require("./src/routes/facilityRoute");
const trainingGalleryRoute = require("./src/routes/trainingGalleryRoute");
const partnershipGalleryRoute = require("./src/routes/partnershipGalleryRoute");
const homeGalleryRoute = require("./src/routes/homeGalleryRoute");

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
app.use("/facility", facilityRoute);
app.use("/training-gallery", trainingGalleryRoute);
app.use("/partnership-gallery", partnershipGalleryRoute);
app.use("/home-gallery", homeGalleryRoute);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
