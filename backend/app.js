const express = require('express');
const cors = require("cors");
const cookieParser = require('cookie-parser');
const errorMiddleware = require('../backend/middlewares/error');
const auth = require('./routes/usermanagement/auth');
const managevehicles = require('./routes/admin/manage_vehicle_routes');
const manageusers = require('./routes/admin/manage_users_routes');
const cookieParser = require('cookie-parser');
const cors = require("cors");
const dotenv = require('dotenv');
const path = require('path');
const multer = require('multer');
const vehicleController = require('./controllers/admin_managment/Admin_vehicleController');
dotenv.config({ path: path.join(__dirname, "config/config.env") });
const manintenance = require('./routes/maintenanceRoutes');



const managevehiclesforusers = require('./routes/usermanagement/uservehiclelist');

const app = express();

// Enable CORS for frontend on localhost:2222
const corsOptions = {
  origin: "http://localhost:2222", // Frontend URL
  methods: "GET,POST,PUT,DELETE",
  credentials: true, // Allow cookies if needed
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Middleware to parse JSON bodies and cookies
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/v1/', managevehicles);
app.use('/api/v1/', manageusers);
app.use('/api/v1/', auth);
app.use('/api/v1/', manintenance);

app.use('/api/v1/', managevehicles);

// Apply error handling middleware
app.use(errorMiddleware);

module.exports = app;
