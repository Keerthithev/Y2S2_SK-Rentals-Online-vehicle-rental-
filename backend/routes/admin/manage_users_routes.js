const express = require('express');
const router = express.Router();
const { 
    getAllUsers,
    getUser,
    updateUser,
    deleteUser,toggleBanUser,getBlacklistedUsers,inviteStaff
 } = require('../../controllers/admin_managment/Admin_userController');


const { isAuthenticatedUser, authorizeRoles } = require('../../middlewares/authenticate')




router.route('/admin/users').get(isAuthenticatedUser,authorizeRoles('admin'), getAllUsers);
router.route('/admin/user/:id').get(isAuthenticatedUser,authorizeRoles('admin'), getUser)
                                .put(isAuthenticatedUser,authorizeRoles('admin'), updateUser)
                                .delete(isAuthenticatedUser,authorizeRoles('admin'), deleteUser);

                                router.route('/admin/user/ban/:id')
    .put(isAuthenticatedUser, authorizeRoles('admin'), toggleBanUser);

    // Admin: Get all blacklisted users
router.get('/admin/blacklist', getBlacklistedUsers);


router.post('/admin/staff/invite', inviteStaff);

module.exports = router;