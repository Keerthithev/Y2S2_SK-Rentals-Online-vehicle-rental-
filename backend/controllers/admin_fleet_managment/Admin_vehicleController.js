const Vehicle= require('../../models/vehicleModel');
const errorHandler = require('../../utils/errorHandler')
const catchAsyncError =require('../../middlewares/catchAsyncError')
const ApiFeatures= require('../../utils/apiFeatures')
exports.getVehicles = async (req, res, next) => {
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
};


exports.newVehicle =catchAsyncError(async (req,res,next)=>{
   const vehicle= await Vehicle.create(req.body);
   console.log(req.body)
   res.status(201).json({
    success:true,
    vehicle
    
   })
}
)

// get single vehicle  --api/v1/vehicle/:id
exports.getSingleVehicle = async(req,res,next)=>{
    const vehicle= await Vehicle.findById(req.params.id);
    if(!vehicle){
        return(next(new errorHandler('Vehicle Not found test',400)))
    }
    res.status(201).json({
        sucess:true,
        vehicle
    })
}
//update vehicle --api/v1/vehicle/:id
exports.updateVehicle =async(req,res,next)=>{
    let vehicle= await Vehicle.findById(req.params.id);
    if(!vehicle){
        res.status(404).json({
            success:false,
            message:"Vehicle Not found"
        }
    )
}

vehicle= await Vehicle.findByIdAndUpdate(req.params.id,req.body,{
    new:true,
    runValidators:true
})
     res.status(200).json({
        sucess:true,
        vehicle
    })
}

//delete vehicle  --api/v1/vehicle/:id

exports.deleteVehicle=async(req,res,next)=>{
    const vehicle= await Vehicle.findById(req.params.id);
    if(!vehicle){
        res.status(404).json({
            success:false,
            message:"Vehicle Not found"
        }
    );
}

await Vehicle.deleteOne({ _id: req.params.id });

res.status(200).json({
    success: true,
    message:"Vehicle deleted"
})
}



