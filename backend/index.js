import express from "express";
import sequelize from "./database.js";
import Profile from "./models/profile.js";
import cors from "cors";

const app = express();
const PORT = 3000;
app.use(cors());
app.use(express.json());

app.post("/profiles", async (req, res) => {
  try {
    const newProfile = await Profile.create(req.body);
    res.status(201).json(newProfile);
  } catch (error) {
    console.error("Error saving profile:", error);
    res.status(500).json({ message: "Failed to save profile" });
  }
});

sequelize.sync().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running and listening on http://localhost:${PORT}`);
  });
});
