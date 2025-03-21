const catchAsyncError = require("../../middlewares/catchAsyncError");
const User=require('../../models/userModels')
const ErrorHandler=require('../../utils/errorHandler')

const crypto = require('crypto')

// Admin: Get all users -/api/v1/admin/users
exports.getAllUsers = catchAsyncError(async (req, res, next) => {
  // Exclude the current admin and users with the 'admin' role
  const users = await User.find({
    _id: { $ne: req.user.id },  // Exclude the current admin by ID
    role: { $ne: 'admin' },     // Exclude all users with the 'admin' role
  });
  
  res.status(200).json({
    success: true,
    users,
  });
});







//Admin :Get specific Users -/api/v1/admin/user/:id
exports.getUser= catchAsyncError(async(req,res,next)=>{
  const user = await User.findById(req.params.id)
  if(!user){
    return next(new ErrorHandler(`User not found with this id ${req.params.id}`))
  }
  res.status(200).json({
    success:true,
    user
  })
})

//Admin: Update user -/api/v1/admin/user/:id
exports.updateUser= catchAsyncError(async(req,res,next)=>{
    const newUserData={
        name:req.body.name,
        email:req.body.email,
        role:req.body.role
    }
   const user= await User.findByIdAndUpdate(req.params.id,newUserData,{
        new: true,
        runValidators: true,
    })

    res.status(200).json({
        success:true,
        user
    })
  })
  

  //Admin :Delete User -/api/v1/admin/user/:id
  exports.deleteUser= catchAsyncError(async(req,res,next)=>{
    const user = await User.findById(req.params.id)
    if(!user){
        return next(new ErrorHandler(`User not found with this id ${req.params.id}`))
      }
     
      await user.deleteOne({ _id: req.params.id });
      res.status(200).json({
        success:true,
    })
  })