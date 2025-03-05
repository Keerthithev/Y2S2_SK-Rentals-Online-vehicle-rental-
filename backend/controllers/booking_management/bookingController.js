//Create new booking -api/v1/booking/new
const catchAsyncError =require('../../middlewares/catchAsyncError')
const booking =require('../../models/bookingModel')


//Create New booking -api/v1/order/new
exports.newBooking =catchAsyncError(async(req,res,next)=>{
        const{
            rentalStartDate,
            rentalEndDate,
            pickUpLocation,
            dropOffLocation,
            totalAmount,
            paymentMethod,
            
        }= req.body;
})