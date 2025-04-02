const mongoose = require("mongoose");

const maintenanceSchema = new mongoose.Schema({
  vehicleId: { type: String, required: true },
  date: { type: Date, required: true },
  type: { type: String, required: true },
  description: { type: String, required: true },
  cost: { type: Number, required: true },
//   file: { type: String } 
//status: { type: String, enum: ["Pending", "Done"], default: "Pending" }
});

module.exports = mongoose.model("Maintenance", maintenanceSchema);
