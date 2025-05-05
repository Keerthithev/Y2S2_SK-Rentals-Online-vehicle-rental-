import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

const FeedbackList = () => {
  const [feedback, setFeedback] = useState([]);
  const [message, setMessage] = useState('');
  const [editingFeedback, setEditingFeedback] = useState(null);
  const [editedComment, setEditedComment] = useState('');
  const [editedRating, setEditedRating] = useState(1);

  useEffect(() => {
    fetchFeedback();
  }, []);

  const fetchFeedback = async () => {
    try {
      const response = await axios.get('http://localhost:1111/api/v1/feedbacks');
      if (response.data.length > 0) {
        setFeedback(response.data);
      } else {
        setMessage('No feedback available.');
      }
    } catch (error) {
      setMessage('Error fetching feedback');
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = await Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to delete this feedback?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, cancel!',
    });

    if (!confirmDelete.isConfirmed) return;

    try {
      await axios.delete(`http://localhost:1111/api/v1/feedback/${id}`);
      setFeedback(feedback.filter((item) => item._id !== id));
      Swal.fire('Deleted!', 'Feedback has been deleted.', 'success');
    } catch (error) {
      Swal.fire('Error!', 'Error deleting feedback', 'error');
    }
  };

  const handleEdit = async (item) => {
    const confirmEdit = await Swal.fire({
      title: 'Edit Feedback',
      text: 'Do you want to edit this feedback?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, edit it!',
      cancelButtonText: 'No, cancel!',
    });

    if (!confirmEdit.isConfirmed) return;

    setEditingFeedback(item._id);
    setEditedComment(item.comment);
    setEditedRating(item.rating);
  };

  const handleUpdate = async () => {
    try {
      const response = await axios.put(`http://localhost:1111/api/v1/feedback/${editingFeedback}`, {
        rating: editedRating,
        comment: editedComment,
      });
      setFeedback(feedback.map(item => item._id === editingFeedback ? response.data.feedback : item));
      setEditingFeedback(null);
      Swal.fire('Updated!', 'Feedback has been updated.', 'success');
    } catch (error) {
      Swal.fire('Error!', 'Error updating feedback', 'error');
    }
  };

  const getSentimentBadge = (rating) => {
    switch (rating) {
      case 5:
        return <span className="sentiment-badge">😍 Excellent</span>;
      case 4:
        return <span className="sentiment-badge">🙂 Good</span>;
      case 3:
        return <span className="sentiment-badge">😐 Average</span>;
      case 2:
        return <span className="sentiment-badge">🙁 Poor</span>;
      case 1:
        return <span className="sentiment-badge">😡 Terrible</span>;
      default:
        return <span className="sentiment-badge">🤔 Unknown</span>;
    }
  };

  return (
    <div className="feedback-dashboard">
      <h2>Customer Feedback</h2>
      {message && <p className="message">{message}</p>}

      {feedback.length > 0 ? (
        <div className="feedback-table">
          <table>
            <thead>
              <tr>
                <th>Customer ID</th>
                <th>Vehicle ID</th>
                <th>Rating</th>
                <th>Comment</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {feedback.map((item) => (
                <tr key={item._id}>
                  <td>{item.customerID}</td>
                  <td>{item.vehicleID}</td>
                  <td>
                    {editingFeedback === item._id ? (
                      <select
                        value={editedRating}
                        onChange={(e) => setEditedRating(Number(e.target.value))}
                      >
                        {[1, 2, 3, 4, 5].map((r) => (
                          <option key={r} value={r}>
                            {r} ⭐
                          </option>
                        ))}
                      </select>
                    ) : (
                      <>
                        <span className="rating-stars">{'⭐'.repeat(item.rating)}</span><br />
                        {getSentimentBadge(item.rating)}
                      </>
                    )}
                  </td>
                  <td>
                    {editingFeedback === item._id ? (
                      <input
                        type="text"
                        value={editedComment}
                        onChange={(e) => setEditedComment(e.target.value)}
                      />
                    ) : (
                      item.comment
                    )}
                  </td>
                  <td>
                    {editingFeedback === item._id ? (
                      <>
                        <button className="save-btn" onClick={handleUpdate}>Save</button>
                        <button className="cancel-btn" onClick={() => setEditingFeedback(null)}>Cancel</button>
                      </>
                    ) : (
                      <>
                        <button className="edit-btn" onClick={() => handleEdit(item)}>Edit</button>
                        <button className="delete-btn" onClick={() => handleDelete(item._id)}>Delete</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="no-feedback">No feedback available.</p>
      )}
    </div>
  );
};

export default FeedbackList;
