const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const cookieParser = require('cookie-parser');
const app = express();
const routes = require("./routes/index");

dotenv.config();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


const PORT = process.env.PORT || 5000;

// Routes
app.use("/api", routes);

app.use((req, res, next) => {
  res.status(404).json({ message: 'Not Found' });
});


connectDB();
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

