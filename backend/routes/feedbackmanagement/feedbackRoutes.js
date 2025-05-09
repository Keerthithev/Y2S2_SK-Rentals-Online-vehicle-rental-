const express = require('express');
const { createFeedback, getFeedback, updateFeedback, deleteFeedback } = require('../../controllers/feedback_management/feedbackController');
const router = express.Router();

router.post('/feedbackform', createFeedback);
router.get('/feedbacks', getFeedback);
router.put('/feedback/:feedbackID', updateFeedback);
router.delete('/feedback/:feedbackID', deleteFeedback);



module.exports = router;
