import React, { useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2'; // Import SweetAlert2
import './FeedbackForm.css'; // Import the updated CSS with hover effects

function FeedbackForm() {
  const [customerID, setCustomerID] = useState('');
  const [vehicleID, setVehicleID] = useState('');
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const handleStarClick = (star) => {
    setRating(star);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate fields
    if (!customerID || !vehicleID || rating === 0 || !comment) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Fields',
        text: '⚠️ Please fill in all fields before submitting.',
        confirmButtonText: 'OK',
        confirmButtonColor: '#FFA500', // Warning color
      });
      return;
    }

    const feedbackData = { customerID, vehicleID, rating, comment };

    try {
      const response = await axios.post('http://localhost:1111/api/v1/feedbackform', feedbackData);

      if (response.status === 201) {
        Swal.fire({
          icon: 'success',
          title: 'Feedback Submitted',
          text: '✅ Feedback submitted successfully!',
          confirmButtonText: 'OK',
          confirmButtonColor: '#b8860b',
        });

        // Reset form values
        setCustomerID('');
        setVehicleID('');
        setRating(0);
        setComment('');
      } else {
        throw new Error('Unexpected response');
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Submission Failed',
        text: error.response?.data?.message || '❌ Error submitting feedback. Please try again.',
        confirmButtonText: 'OK',
        confirmButtonColor: '#f44336',
      });
    }
  };

  return (
    <div className="feedback-container">
      <h2>Submit Your Feedback</h2>

      <form onSubmit={handleSubmit} className="feedback-form">
        <div className="form-group">
          <label>Customer ID:</label>
          <input
            type="text"
            value={customerID}
            onChange={(e) => setCustomerID(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Vehicle ID:</label>
          <input
            type="text"
            value={vehicleID}
            onChange={(e) => setVehicleID(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Rating:</label>
          <div className="star-rating">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={`star ${rating >= star ? 'selected' : ''}`}
                onClick={() => handleStarClick(star)}
              >
                ★
              </span>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label>Comment:</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="submit-btn">Submit Feedback</button>
      </form>
    </div>
  );
}

export default FeedbackForm;
