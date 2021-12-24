import express, { urlencoded } from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import { readdirSync } from "fs";
dotenv.config();
const morgan = require("morgan");

const { MONGO_URI, PORT } = process.env;

const app = express();

//DB
mongoose
  .connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("DB connected"))
  .catch((err) => console.log("DB connection error =>", err));

//middlewares
app.use(express.json({ limit: "5mb" }));
app.use(cors());
app.use(urlencoded({ extended: true }));

readdirSync('./routes').map((r) => app.use('/api', require(`./routes/${r}`)));

app.listen(PORT || 8000, () => console.log(`server running on PORT ${PORT}`));
