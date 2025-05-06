const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
    name: { type: String, required: true },
    brand: { type: String, required: true },
    model: { type: String, required: true },
    year: { type: String, required: true },
    fuelType: { type: String, required: true },
    transmission: { type: String, required: true },
    seatingCapacity: { type: Number, required: true },
    rentPerDay: { type: Number, required: true },
    description: { type: String, required: true },
    images: [{
        url: {
            type: String,
            required: true
        },
        public_id: {
            type: String,
            required: true
        }
    }],
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true },

    licensePlateNumber: {
        type: String,
        unique: false,
        required: true
    },

    vehicleType: {
        type: String,
        enum: [
            'Economy cars',
            'Compact cars',
            'SUVs',
            'Luxury cars',
            'Vans',
            'KDH vans',
            'Motorbikes',
            'Electric bikes'
        ],
        required: true
    },
    mileage: { 
        type: Number, 
        required: true 
    },
    isTuned: { 
        type: Boolean, 
        required: true 
    },
    lastInsuranceDate: { 
        type: Date, 
        required: true 
    },
    availableStatus: { 
        type: Boolean, 
        required: true ,
        default: true,
    }
});

module.exports = mongoose.model('Vehicle', vehicleSchema);
