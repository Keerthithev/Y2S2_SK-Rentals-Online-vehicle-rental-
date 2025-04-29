
    const { getVehicles,getSingleVehicle} = require("../../controllers/admin_managment/Admin_vehicleController");

  

  const express = require('express');
  const router = express.Router();
  
 
  //Route to get all vehicles (admin only)
  router.route('/vehicles').get( getVehicles);
    router.route('/vehicle/:id').get( getSingleVehicle);


  module.exports = router;
  