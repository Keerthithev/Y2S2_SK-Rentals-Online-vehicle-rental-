const express = require('express');
const router = express.Router();
const { 
    getAllUsers,
    getUser,
    updateUser,
    deleteUser
 } = require('../../controllers/admin_fleet_managment/Admin_userController');


const { isAuthenticatedUser, authorizeRoles } = require('../../middlewares/authenticate')




router.route('/admin/users').get(isAuthenticatedUser,authorizeRoles('admin'), getAllUsers);
router.route('/admin/user/:id').get(isAuthenticatedUser,authorizeRoles('admin'), getUser)
                                .put(isAuthenticatedUser,authorizeRoles('admin'), updateUser)
                                .delete(isAuthenticatedUser,authorizeRoles('admin'), deleteUser);

                                
module.exports = router;