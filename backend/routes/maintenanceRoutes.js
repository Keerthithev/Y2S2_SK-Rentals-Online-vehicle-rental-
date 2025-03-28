const express = require("express");
// const multer = require("multer");
const { getAllMaintenance, addMaintenance, deleteMaintenance, editMaintenance } = require("../controllers/maintenanceController");

const router = express.Router();

// // File upload setup
// const storage = multer.diskStorage({
//   destination: "uploads/",
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + "-" + file.originalname);
//   }
// });
// const upload = multer({ storage });

// Routes
router.get("/maintenances", getAllMaintenance);
router.post("/add",  addMaintenance);
router.delete("/maintenances/delete/:id", deleteMaintenance);
router.put("/maintenances/edit/:id", editMaintenance); 


module.exports = router;
