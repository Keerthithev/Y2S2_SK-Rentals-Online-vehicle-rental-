import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

function FeedbackForm() {
  const [customerID, setCustomerID] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [vehicleID, setVehicleID] = useState('');
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [sentiment, setSentiment] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch customer info from token
  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:1111/api/v1/myprofile', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const user = res.data.user;
        setCustomerID(user._id);
        setCustomerName(user.name); // Assumes user object has a "name" field
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Unauthorized',
          text: '⚠️ Please log in again to continue.',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCustomer();
  }, []);

  const handleStarClick = (star) => setRating(star);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!vehicleID.trim() || rating === 0 || !comment.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Fields',
        text: '⚠️ Please fill in all required fields before submitting.',
        confirmButtonText: 'OK',
        confirmButtonColor: '#FFA500',
      });
      return;
    }

    if (rating < 1 || rating > 5) {
      Swal.fire({
        icon: 'warning',
        title: 'Invalid Rating',
        text: '⚠️ Rating must be between 1 and 5.',
        confirmButtonText: 'OK',
        confirmButtonColor: '#FFA500',
      });
      return;
    }

    if (comment.length < 5) {
      Swal.fire({
        icon: 'warning',
        title: 'Comment Too Short',
        text: '⚠️ Comment must be at least 5 characters long.',
        confirmButtonText: 'OK',
        confirmButtonColor: '#FFA500',
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

        setVehicleID('');
        setRating(0);
        setComment('');
        setSentiment(response.data.sentiment);
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

  if (loading) return <p>Loading...</p>;

  return (
    <div className="feedback-container">
      <h2>Submit Your Feedback</h2>
      <form onSubmit={handleSubmit} className="feedback-form">
        {/* ✅ Show Customer Name */}
        <div className="form-group">
          <label>Customer Name:</label>
          <input type="text" value={customerName} readOnly />
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

      {sentiment && (
        <div className="sentiment-badge" style={{ marginTop: '15px' }}>
          <strong>Sentiment:</strong>{' '}
          <span className={`badge badge-${sentiment}`}>
            {sentiment.charAt(0).toUpperCase() + sentiment.slice(1)}
          </span>
        </div>
      )}
    </div>
  );
}

export default FeedbackForm;
