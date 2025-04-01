const catchAsyncError = require("../../middlewares/catchAsyncError");
const User=require('../../models/userModels')
const ErrorHandler=require('../../utils/errorHandler')
const sendEmail = require("../../utils/email");
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

// Admin: Toggle Ban Status - /api/v1/admin/user/ban/:id
exports.toggleBanUser = catchAsyncError(async (req, res, next) => {
  const { isBanned, reason, unbanReason } = req.body;

  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new ErrorHandler(`User not found with this ID: ${req.params.id}`));
  }

  const userName = user.username || user.name || "User"; // Ensure a valid name

  let emailSubject, emailMessage;

  if (isBanned) {
    user.bannedUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    user.banStartDate = new Date();
    user.banEndDate = user.bannedUntil;
    user.banReason = reason || "No reason provided";
    user.blacklisted = true;
    user.unbanReason = null;

    emailSubject = "🚫 Account Suspension Notice - SK Vehicle Rental";
    emailMessage = `
      <p>Dear <strong>${userName}</strong>,</p>
      
      <p>We regret to inform you that your account has been suspended for <strong>30 days</strong> due to the following reason:</p>
      
      <blockquote style="background: #f8f8f8; padding: 10px; border-left: 4px solid #d9534f;">
        <strong>Reason:</strong> ${user.banReason}
      </blockquote>
      
      <p>During this period, you will not be able to access our services. If you believe this action was taken in error, you may appeal by contacting our support team.</p>
      
      <p>Thank you for your understanding.</p>
      
      <p>Best regards,</p>
      <p><strong>SK Vehicle Rental Team</strong></p>
    `;
  } else {
    user.bannedUntil = null;
    user.unbanReason = unbanReason || "No reason provided";

    emailSubject = "✅ Account Reinstated - SK Vehicle Rental";
    emailMessage = `
      <p>Dear <strong>${userName}</strong>,</p>
      
      <p>We are pleased to inform you that your account has been successfully reinstated.</p>
      
      <blockquote style="background: #f8f8f8; padding: 10px; border-left: 4px solid #5cb85c;">
        <strong>Reason:</strong> ${user.unbanReason}
      </blockquote>
      
      <p>You can now log in and continue using our services.</p>
      
      <p>If you have any questions, feel free to reach out to our support team.</p>
      
      <p>Best regards,</p>
      <p><strong>SK Vehicle Rental Team</strong></p>
    `;
  }

  await user.save();

  try {
    await sendEmail({
      email: user.email,
      subject: emailSubject,
      message: emailMessage,
    });

    console.log(`📩 Email sent successfully to: ${user.email}`);
  } catch (error) {
    console.error(`❌ Email sending failed for: ${user.email} - Error:`, error.message);
  }

  res.status(200).json({
    success: true,
    message: isBanned ? "User banned for 30 days. Email sent." : "User unbanned. Email sent.",
    user,
  });
});



// Admin: Get Blacklisted Users - /api/v1/admin/blacklist
exports.getBlacklistedUsers = catchAsyncError(async (req, res, next) => {
  const blacklistedUsers = await User.find({ blacklisted: true });

  res.status(200).json({
      success: true,
      blacklistedUsers,
  });
});


// Admin: Send Staff Invitation Email - /api/v1/admin/staff/invite
exports.inviteStaff = catchAsyncError(async (req, res, next) => {
  try {
      const { email } = req.body;
      
      // Check if email exists in DB
      const existingUser = await User.findOne({ email });
      if (existingUser) {
          return res.status(400).json({ success: false, message: "User already exists with this email!" });
      }

      // Generate a secure token
      const token = crypto.randomBytes(32).toString("hex");

      // Create a temporary link for staff registration
      const registerLink = `http://localhost:2222/register?token=${token}&role=staff`;
      console.log(registerLink);
      // Send Email
      await sendEmail({
          email,
          subject: "📩 Invitation to Join SK Vehicle Rental as Staff",
          message: `
              <p>Dear Staff,</p>
              
              <p>You have been invited to join <strong>SK Vehicle Rental</strong> as a staff member.</p>
              
              <p>Click the link below to complete your registration:</p>

              <p><a href="${registerLink}" style="color: #008cba; text-decoration: none; font-weight: bold;">Complete Registration</a></p>

              <p>If you did not request this, please ignore this email.</p>

              <p>Best regards,</p>
              <p><strong>SK Vehicle Rental Team</strong></p>
          `,
      });

      return res.status(200).json({ success: true, message: "Invitation email sent successfully!" });

  } catch (error) {
      console.error("Error sending invitation email:", error);
      return res.status(500).json({ success: false, message: "Error sending email." });
  }
});