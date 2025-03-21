const mongoose = require("mongoose");
const validator = require('validator');
const bcrypt = require('bcryptjs');  // This is correct for bcryptjs



const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please enter name']
    },
    email: {
        type: String,
        required: [true, 'Please enter email'],
        unique: true,
        validate: [validator.isEmail, 'Please enter a valid email address']
    },
    password: {
        type: String,
        required: [true, 'Please enter password'],
       // maxlength: [6, 'Password cannot exceed 6 characters'],
        select: false
    },
    phone: {
        type: String,
        required: [true, 'Please enter phone number'],
        unique: true,
        validate: {
            validator: function(value) {
                return /^[0-9]{10}$/.test(value); // Ensures exactly 10 digits
            },
            message: 'Phone number must be exactly 10 digits.',
           
        }
        
    },
    address: {
        type: String,
        required: [true, 'Please enter address']
    },
    dateOfBirth: {
        type: Date,
        required: [true, 'Please enter date of birth'],

        validate: {
            validator: function(value) {
                const today = new Date();
                const birthDate = new Date(value);
                const age = today.getFullYear() - birthDate.getFullYear();
                const month = today.getMonth() - birthDate.getMonth();
                
                if (age < 18 || age > 80 || (age === 18 && month < 0) || (age > 80 && month > 0)) {
                    return false; // Age must be between 18 and 80
                }
                return true;
            },
            message: 'Age must be between 18 and 80 years.',
        }
    },
    driversLicense: {
        type: String,
        required: [true, 'Please enter driver\'s license number'],
        unique: true,
        validate: {
            // Sri Lankan driver's license validation: Starts with two uppercase letters followed by 10 digits
            validator: function(value) {
                return /^[A-Z]{2}-\d{10}$/.test(value); // Regex for Sri Lankan license format
            },
            message: 'Please enter a valid Sri Lankan driver\'s license number (e.g., AB-1234567890).'
        },
        set: function(value) {
            // Automatically insert the hyphen if the license number starts with two letters and is followed by 10 digits
            if (value && /^[A-Z]{2}\d{10}$/.test(value)) {
                return value.slice(0, 2) + '-' + value.slice(2); // Insert the hyphen after the first two letters
            }
            return value; // Return as-is if the hyphen is already present
        }
    },
    role: {
        type: String,
        required: true,
        default: "user"
    },
    
  // New fields for OTP
  resetPasswordOtp: {
    type: Number, // Store OTP as a number
},
resetPasswordOtpExpire: {
    type: Date, // Store OTP expiration time
},

    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Middleware for hashing password before saving
userSchema.pre('save', async function(next) {
    if (this.isModified('password')) {  // Only hash if password is modified
        if (!this.password) {
            return next(new Error('Password is required'));
        }
        try {
            this.password = await bcrypt.hash(this.password, 10);  // Hash the password
        } catch (err) {
            return next(err);  // Pass any error to the next middleware
        }
    }
    next();  // Continue with the save operation
});

// Middleware for age validation: Ensuring the user is at least 18 years old
userSchema.pre('save', function(next) {
    const today = new Date();
    const age = today.getFullYear() - this.dateOfBirth.getFullYear();
    const m = today.getMonth() - this.dateOfBirth.getMonth();
    
    // Check if the user is under 18 years old
    if (age < 18 || (age === 18 && m < 0)) {
        return next(new Error('You are under 18 and cannot rent a vehicle.'));
    }
    next();
});

// JWT token generation method
userSchema.methods.getJwtToken = function() {
    return jwt.sign({ id: this.id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_TIME
    });
};

// Password validation method
userSchema.methods.isValidPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Reset token generation method
userSchema.methods.getResetToken = function() {
    const token = crypto.randomBytes(20).toString('hex');

    // Generate hash and set reset password token
    this.resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');

    // Set token expire time (30 minutes)
    this.resetPasswordTokenExpire = Date.now() + 30 * 60 * 1000;
    return token;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
