const vehicles = require('../data/vehicles.json')
const vehicle = require('../models/vehicleModel')

const dotenv =require('dotenv');
const connectDatabase = require('../config/database')

dotenv.config({path:'backend/config/config.env'})
connectDatabase();

const seedVehicles = async()=>{
    try{
        await   vehicle.deleteMany();
        console.log("vehicles deleted")
        await vehicle.insertMany(vehicles);
        console.log('All vehicles added')
    } catch(error){
    console.log(error.message)
   }
   process.exit();
}

seedVehicles();