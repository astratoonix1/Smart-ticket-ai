import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { ticketRoutes } from "./tickets.js";
import { userRoutes } from "./users.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config();
const PORT = process.env.PORT || 3000;

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/users", userRoutes);
app.use("/api/tickets", ticketRoutes);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((err) => {
    console.error("MongoDB connection error: ", err);
  });

// Serve the built frontend (if present, e.g. when built via Dockerfile)
const publicDir = path.join(__dirname, "public");
app.use(express.static(publicDir));

// Any non-API route returns the frontend so client-side routing works
app.get(/^(?!\/api).*/, (req, res) => {
  res.sendFile(path.join(publicDir, "index.html"), (err) => {
    if (err) res.status(200).send("Backend is running. (Frontend not built into this image.)");
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
