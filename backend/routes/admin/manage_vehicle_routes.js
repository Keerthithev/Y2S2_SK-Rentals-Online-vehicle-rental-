
    const {newVehicle,getSingleVehicle, getVehicles, deleteVehicle, updateVehicle} = require("../../controllers/admin_managment/Admin_vehicleController");

  
  
  const { isAuthenticatedUser, authorizeRoles } = require('../../middlewares/authenticate');
  const express = require('express');
  const router = express.Router();
  
  // Route to get all vehicles
  /* router.route('/admin/vehicles').get(getVehicles);
  
  // Route to add a new vehicle (admin only)
  router.route('/admin/vehicle/new').post(newVehicle);
  
  // Route to get a single vehicle by ID
  router.route('/admin/vehicle/:id').get(getSingleVehicle);
  
  // Route to update a vehicle (admin only)
  router.route('/admin/vehicle/:id').put(isAuthenticatedUser, authorizeRoles('admin'), updateVehicle);
  
  // Route to delete a vehicle (admin only)
  router.route('/admin/vehicle/:id').delete(isAuthenticatedUser, authorizeRoles('admin'), deleteVehicle); */

  // router.route('/admin/vehicle/new').post(isAuthenticatedUser, authorizeRoles('admin'),newVehicle);
  //Route to get all vehicles (admin only)
  router.route('/admin/vehicles').get(isAuthenticatedUser, authorizeRoles('admin'), getVehicles);
  router.route('/admin/vehicle/:id').get(isAuthenticatedUser, authorizeRoles('admin'), getSingleVehicle);
// Route to delete a vehicle (admin only)
router.route('/admin/vehicle/:id').delete(isAuthenticatedUser, authorizeRoles('admin'), deleteVehicle);

  // // Route to update a vehicle (admin only)
  // router.route('/admin/vehicle/:id').put(isAuthenticatedUser, authorizeRoles('admin'), updateVehicle);


  module.exports = router;
  