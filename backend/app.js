const express = require('express');
const app = express();
const errorMiddleware = require('../backend/middlewares/error');
const auth = require('./routes/usermanagement/auth');
const managevehicles = require('./routes/admin/manage_vehicle_routes');
const manageusers = require('./routes/admin/manage_users_routes');
const manintenance = require('./routes/maintenanceRoutes')
const cookieParser = require('cookie-parser');
const cors = require("cors");
const dotenv = require('dotenv');
const path = require('path');
const multer = require('multer');
const vehicleController = require('./controllers/admin_managment/Admin_vehicleController');
dotenv.config({ path: path.join(__dirname, "config/config.env") });


const managevehiclesforusers = require('./routes/usermanagement/uservehiclelist');


// Enable CORS for frontend on localhost:2222
const corsOptions = {
  origin: "http://localhost:2222", // Frontend URL
  methods: "GET,POST,PUT,DELETE,PATCH",
  credentials: true, // Allow cookies if needed
};

// Apply CORS middleware
app.use(cors(corsOptions));

const storage = multer.memoryStorage();  // You can also use diskStorage for saving to disk
const upload = multer({ storage: storage });
const { isAuthenticatedUser, authorizeRoles } = require('./middlewares/authenticate');

app.use(express.json()); // This is necessary to parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // To parse URL-encoded data
app.use(cookieParser());

// Define routes
// app.use('/api/v1/', managevehicles);
app.use('/api/v1/', manageusers);
app.use('/api/v1/', auth);

app.use('/api/v1/', managevehicles);

// Apply error handling middleware
app.use(errorMiddleware);

// Routes
app.use('/api/v1/', managevehicles);
app.use('/api/v1/', manageusers);
app.use('/api/v1/', auth);
app.use('/api/v1/', manintenance);

app.use('/api/v1/', managevehicles);

// Apply error handling middleware
app.use(errorMiddleware);

app.use('/api/v1/', managevehicles);
app.use('/api/v1/', managevehiclesforusers);


module.exports = app;  // Export the app to be used in server.js

app.post('/api/v1/admin/vehicle/new', upload.none(),isAuthenticatedUser, authorizeRoles('admin'), vehicleController.newVehicle);

app.put('/api/v1/admin/vehicle/:vehicleId', upload.none(), isAuthenticatedUser, authorizeRoles('admin'), vehicleController.updateVehicle);

  
