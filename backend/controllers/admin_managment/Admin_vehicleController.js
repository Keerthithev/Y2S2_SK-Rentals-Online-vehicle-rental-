const Vehicle = require('../../models/vehicleModel');
const errorHandler = require('../../utils/errorHandler');
const catchAsyncError = require('../../middlewares/catchAsyncError');
const ApiFeatures = require('../../utils/apiFeatures');
const cloudinary = require('../../config/cloudinary');
console.log(cloudinary); // Check if cloudinary is properly initialized


// Get all vehicles -- api/v1/vehicles
/* exports.getVehicles = async (req, res, next) => {
    const resPerPage = 10;  // Vehicles per page
    const apiFeatures = new ApiFeatures(Vehicle.find(), req.query)
        .search()
        .filter()
        .paginate(resPerPage);

    // Fetch the vehicles for the current page
    const vehicles = await apiFeatures.query;

    // Get the total count of vehicles (not just for the current page)
    const totalCount = await Vehicle.countDocuments();  // Total count of vehicles

    res.status(200).json({
        success: true,
        count: totalCount, // Total number of vehicles for pagination
        vehicles
    });
}; */

// Add a new vehicle -- api/v1/admin/vehicle/new
// Controller to handle new vehicle creation
exports.newVehicle = catchAsyncError(async (req, res, next) => {
    console.log('Received vehicle data:', req.body);

    const { 
        name, 
        brand, 
        model, 
        year, 
        fuelType, 
        transmission, 
        seatingCapacity, 
        rentPerDay, 
        description, 
        images, 
        adminId, 
        licensePlateNumber, 
        vehicleType, 
        mileage, 
        isTuned, 
        lastInsuranceDate, 
        availableStatus 
    } = req.body;

    // Validate required fields
    if (!name || !brand || !model || !year || !fuelType || !transmission || !seatingCapacity || 
        !rentPerDay || !description || !images || images.length === 0 || !adminId || 
        !licensePlateNumber || !vehicleType || !mileage || isTuned === undefined || 
        !lastInsuranceDate || availableStatus === undefined) {
        return next(new errorHandler('Please provide all vehicle details', 400));
    }

    // Map image URLs to objects
    const imageObjects = images.map(url => ({
        url: url,
        public_id: 'some_default_public_id' // You can change this or remove it if not needed
    }));

    // Create a new vehicle
    const vehicle = await Vehicle.create({
        name,
        brand,
        model,
        year,
        fuelType,
        transmission,
        seatingCapacity,
        rentPerDay,
        description,
        images: imageObjects,
        adminId,
        licensePlateNumber,
        vehicleType,
        mileage,
        isTuned,
        lastInsuranceDate,
        availableStatus
    });

    console.log('Vehicle created:', vehicle);

    res.status(201).json({
        success: true,
        vehicle
    });
});


// Get all vehicles -- api/v1/vehicles
exports.getVehicles = catchAsyncError(async (req, res, next) => {
    // Create API query features: search and filter only (no pagination)
    const apiFeatures = new ApiFeatures(Vehicle.find(), req.query)
        .search()
        .filter();

    // Fetch all matching vehicles
    const vehicles = await apiFeatures.query;

    // Get total count of vehicles matching the filters
    const totalCount = await Vehicle.countDocuments(apiFeatures.query.getFilter());

    if (!vehicles.length) {
        return next(new errorHandler("No vehicles found", 404));
    }

    res.status(200).json({
        success: true,
        count: totalCount,
        vehicles
    });
});

/*
// Update a vehicle -- api/v1/vehicle/:id
exports.updateVehicle = catchAsyncError(async (req, res, next) => {
    let vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) {
        return next(new errorHandler('Vehicle not found', 404));  // Improved error message
    }

    // Check if images need to be updated
    if (req.body.images) {
        // Delete previous images from Cloudinary (optional, based on business logic)
        for (let i = 0; i < vehicle.images.length; i++) {
            await cloudinary.uploader.destroy(vehicle.images[i].public_id);
        }

        const uploadedImages = [];
        for (let i = 0; i < req.body.images.length; i++) {
            const result = await cloudinary.uploader.upload(req.body.images[i], { folder: 'vehicles' });
            uploadedImages.push({
                url: result.secure_url,
                public_id: result.public_id,
            });
        }

        req.body.images = uploadedImages;
    }

    // Update the vehicle
    vehicle = await Vehicle.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        success: true,
        vehicle
    });
});

// Delete a vehicle -- api/v1/vehicle/:id
exports.deleteVehicle = catchAsyncError(async (req, res, next) => {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) {
        return next(new errorHandler('Vehicle not found', 404));  // Improved error handling
    }

    // Delete images from Cloudinary before deleting the vehicle
    for (let i = 0; i < vehicle.images.length; i++) {
        await cloudinary.uploader.destroy(vehicle.images[i].public_id);
    }

    await Vehicle.deleteOne({ _id: req.params.id });

    res.status(200).json({
        success: true,
        message: 'Vehicle deleted successfully'
    });
}); */

// Delete a vehicle -- api/v1/admin/vehicle/:id
exports.deleteVehicle = catchAsyncError(async (req, res, next) => {
    try {
        console.log('Delete request received for ID:', req.params.id);

        // Find the vehicle by ID
        const vehicle = await Vehicle.findById(req.params.id);
        if (!vehicle) {
            console.log('Vehicle not found in DB');
            return res.status(404).json({ success: false, message: 'Vehicle not found' });
        }

        // Delete images from Cloudinary
        if (vehicle.images && vehicle.images.length > 0) {
            console.log('Deleting images from Cloudinary...');
            try {
                for (let img of vehicle.images) {
                    if (img.public_id) {
                        try {
                            await cloudinary.uploader.destroy(img.public_id);
                            console.log(`Deleted image with public_id: ${img.public_id}`);
                        } catch (err) {
                            console.error('Error deleting image:', err);
                        }
                    } else {
                        console.error('No public_id found for image:', img);
                    }
                }
            } catch (err) {
                console.error('Error during image deletion process:', err);
            }
            
        }

        // Delete the vehicle from the database
        const deleteResult = await Vehicle.deleteOne({ _id: req.params.id });
        if (deleteResult.deletedCount === 0) {
            return res.status(404).json({ success: false, message: 'Vehicle not found for deletion' });
        }

        console.log('Vehicle deleted successfully');
        res.status(200).json({ success: true, message: 'Vehicle deleted successfully' });
    } catch (error) {
        console.error('Error deleting vehicle:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
    }
});


// Update a vehicle -- api/v1/admin/vehicle/:id
exports.updateVehicle = catchAsyncError(async (req, res, next) => {
    try {
        // Step 1: Log incoming data for debugging
        console.log("Request Body: ", req.body);
        console.log("Vehicle ID: ", req.params.vehicleId);

        // Find the vehicle by ID
        let vehicle = await Vehicle.findById(req.params.vehicleId);
        if (!vehicle) {
            return next(new errorHandler('Vehicle not found', 404)); 
        }

        // Step 2: Check if images need updating
        if (req.body.images && Array.isArray(req.body.images) && req.body.images.length > 0) {
            console.log("Updating images...");
            
            // Ensure Cloudinary is initialized
            console.log(cloudinary.uploader);

            if (!cloudinary.uploader) {
                console.error("Cloudinary uploader is undefined!");
                return next(new errorHandler('Image upload failed due to Cloudinary misconfiguration', 500));
            }

            const uploadedImages = [];
            for (let i = 0; i < req.body.images.length; i++) {
                try {
                    console.log(`Uploading image ${i + 1}...`);
                    console.log("Uploading Image: ", req.body.images[i]);

                    const result = await cloudinary.uploader.upload(req.body.images[i], { folder: 'vehicles' });
                    uploadedImages.push({
                        url: result.secure_url,
                        public_id: result.public_id,
                    });
                } catch (error) {
                    console.error("Cloudinary upload failed: ", error);
                    return next(new errorHandler(`Image upload failed at index ${i + 1}`, 500));
                }
            }

            req.body.images = uploadedImages; // Update images in request body
        }

        // Step 3: Update vehicle
        vehicle = await Vehicle.findByIdAndUpdate(req.params.vehicleId, req.body, {
            new: true, // Return updated document
            runValidators: true, // Apply validation rules
        });

        if (!vehicle) {
            return next(new errorHandler('Failed to update vehicle', 500)); 
        }

        // Step 4: Send response back to client
        res.status(200).json({
            success: true,
            message: "Vehicle updated successfully",
            vehicle
        });
    } catch (err) {
        console.error("Error in updating vehicle: ", err);
        next(new errorHandler('An error occurred while updating the vehicle', 500));
    }
});





// Get a single vehicle -- api/v1/vehicle/:id
exports.getSingleVehicle = catchAsyncError(async (req, res, next) => {
    // Extract vehicle ID from the URL parameters
    const { id } = req.params;

    // Find the vehicle by its ID
    const vehicle = await Vehicle.findById(id);

    // If no vehicle is found, return an error
    if (!vehicle) {
        return next(new errorHandler("Vehicle not found", 404));
    }

    // If vehicle found, return the vehicle details
    res.status(200).json({
        success: true,
        vehicle
    });
});
