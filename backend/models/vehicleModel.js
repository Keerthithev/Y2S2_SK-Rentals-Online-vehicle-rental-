const mongoose = require("mongoose");

const vehicleSchema = new mongoose.Schema({
  id:{type:String},
  make: { 
    type: String, 
    required: [true, "Please enter the vehicle make (e.g., Toyota, Honda)"] 
  },
  model: { 
    type: String, 
    required: [true, "Please enter the vehicle model (e.g., Corolla, Civic)"] 
  },
  year: { 
    type: Number, 
    required: [true, "Please enter the manufacturing year"] 
  },
  type: { 
    type: String, 
    enum: {
      values: ['Economy Cars', 'Compact Cars', 'Luxury Cars', 'Vans/KDH Vans', 'Motor Bikes', 'Electric Bikes'],
      message: "Invalid vehicle type. Choose from: Economy Cars, Compact Cars, Luxury Cars, Vans/KDH Vans, Motor Bikes, Electric Bikes"
    },
    required: [true, "Please enter the vehicle category"]
  },
  rental_price_per_day: { 
    type: Number, 
    required: [true, "Please enter the rental price per day"] 
  },
  discount: { 
    type: Number, 
    default: 0 
  },
  availability_status: { 
    type: String, 
    enum: {
      values: ["available", "rented", "under_maintenance"], 
      message: "Invalid availability status. Choose from: available, rented, under_maintenance"
    }, 
    default: "available" 
  },
  location: { 
    type: String, 
    required: [true, "Please enter the vehicle location"] 
  },
  fuel_type: { 
    type: String, 
    enum: {
      values: ["Petrol", "Diesel", "Electric", "Hybrid"],
      message: "Invalid fuel type. Choose from: Petrol, Diesel, Electric, Hybrid"
    }, 
    required: [true, "Please select a fuel type"]
  },
  transmission: { 
    type: String, 
    enum: {
      values: ["Manual", "Automatic"],
      message: "Invalid transmission type. Choose either Manual or Automatic"
    }, 
    required: [true, "Please select a transmission type"]
  },
  seating_capacity: { 
    type: Number, 
    required: [true, "Please enter the seating capacity"] 
  },
  mileage: { 
    type: Number, 
    required: [true, "Please enter the vehicle mileage"] 
  },
  last_service_date: { 
    type: Date, 
    required: [true, "Please enter the last service date"] 
  },
  insurance_expiry: { 
    type: Date, 
    required: [true, "Please enter the insurance expiry date"] 
  },
  added_by: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Admin", 
    required: [ "Vehicle must be added by an admin"] 
  },
  updated_by: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Admin" 
  },
  images: [
    { image: String } // Array of image URLs
  ],
  reviews: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User " },
      rating: { 
        type: Number, 
        min: [1, "Rating must be at least 1"], 
        max: [5, "Rating cannot exceed 5"] 
      },
      comment: { type: String }
    }
  ]
}, { timestamps: true });

const Vehicle = mongoose.model("Vehicle", vehicleSchema);
module.exports = Vehicle;