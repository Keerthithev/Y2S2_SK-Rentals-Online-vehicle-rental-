const { getVehicles,
        newVehicle,
        getSingleVehicle,
        updateVehicle,
        deleteVehicle } = require("../../controllers/admin_fleet_managment/Admin_vehicleController");

const {isAuthenticatedUser, authorizeRoles} =require('../../middlewares/authenticate')
const express = require('express');
const router= express.Router();

router.route('/admin/vehicles').get(getVehicles)
router.route('/admin/vehicle/new').post(newVehicle)
router.route('/admin/vehicle/:id').get(getSingleVehicle)
router.route('/admin/vehicle/:id').put(isAuthenticatedUser,authorizeRoles('admin'),updateVehicle)
router.route('/admin/vehicle/:id').delete(isAuthenticatedUser,authorizeRoles('admin'),deleteVehicle)

module.exports =router;