const express = require('express');
const { registerUser } = require('../../controllers/user_management/authController');
const { loginUser } = require('../../controllers/user_management/authController');
const { logoutUser } = require('../../controllers/user_management/authController');
const { forgotPassword } = require('../../controllers/user_management/authController');
const { resetPassword } = require('../../controllers/user_management/authController');
const {isAuthenticatedUser}= require('../../middlewares/authenticate');
const { getUserProfile } = require('../../controllers/user_management/authController');
const { changePasswsword } = require('../../controllers/user_management/authController');
const { UpdateProfile } = require('../../controllers/user_management/authController');
const router=express.Router();

router.route('/register').post(registerUser);
router.route('/login').post(loginUser);
router.route('/logout').get(logoutUser);
router.route('/password/forgot').post(forgotPassword);
router.route('/password/reset').post(resetPassword);
router.route('/myprofile').get(isAuthenticatedUser,getUserProfile);
router.route('/password/change').put(isAuthenticatedUser,changePasswsword);
router.route('/update').put(isAuthenticatedUser,UpdateProfile);

module.exports=router;