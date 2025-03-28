const Maintenance = require('../models/maintenance');

// Get all maintenance records
exports.getAllMaintenance = async (req, res) => {
  try {
    const records = await Maintenance.find();
    res.json(records);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// Add new maintenance record
exports.addMaintenance = async (req, res) => {
    try {
      console.log(req.body); // Log the request body to see what is being sent
  
      const { vehicleId, date, type, description, cost } = req.body;
  
      // Validation: Check if required fields are provided
      if (!vehicleId || !cost || !date || !type || !description) {
        return res.status(400).json({
          error: "vehicleId, date, type, description, and cost are required fields.",
        });
      }
  
      // Create a new maintenance record
      const newRecord = new Maintenance({ vehicleId, date, type, description, cost });
  
      // Save the new record
      await newRecord.save();
  
      res.status(201).json(newRecord);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  };
  
 
// Delete a record
exports.deleteMaintenance = async (req, res) => {
  try {
    const record = await Maintenance.findByIdAndDelete(req.params.id);
    if (!record) {
      return res.status(404).json({ error: "Record not found" });
    }
    res.json({ message: "Record deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};





exports.editMaintenance = async (req, res) => {
  try {
    const { vehicleId, date, type, description, cost } = req.body;

    // Validation: Check if required fields are provided
    if (!vehicleId || !cost || !date || !type || !description) {
      return res.status(400).json({
        error: "vehicleId, date, type, description, and cost are required fields.",
      });
    }

    // Find and update the record
    const updatedRecord = await Maintenance.findByIdAndUpdate(
      req.params.id,
      { vehicleId, date, type, description, cost }, 
      { new: true } // Return updated document
    );

    if (!updatedRecord) {
      return res.status(404).json({ error: "Record not found" });
    }

    res.json(updatedRecord);
  } catch (error) {
    console.error("Error updating record:", error);
    res.status(500).json({ error: error.message });
  }
};