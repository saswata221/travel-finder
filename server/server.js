// server/server.js
import dotenv from "dotenv";
dotenv.config();

import { createApp } from "./src/app.js";

const app = createApp();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`API running on :${PORT}`));
