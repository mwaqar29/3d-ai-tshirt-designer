import express from "express";
import * as dotenv from "dotenv";
import cors from "cors";
import aiImgGenRoutes from "./routes/ai-image-gen.routes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json({ limit: "50mb" }));

app.use("/api/v1/aiImgGen", aiImgGenRoutes);

app.get("/", (req, res) => {
  res.status(200).json({ message: "Hello from Backend" });
});

app.listen(8080, () => console.log("Server has started on port 8080"));
