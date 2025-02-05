import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';


const ComplaintDetailsScreen = ({ complaintId, onClose }) => {
  const { id } = useParams(); // Retrieve the complaint ID from the URL
  const navigate = useNavigate(); // For navigating back to the previous screen
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [remarks, setRemarks] = useState(''); // State for remarks



  
  useEffect(() => {
    const fetchComplaintDetails = async () => {
      try {
        const response = await axios.get(`https://servicedeskadmin-v3.onrender.com/ServiceAdminEscalate/escalated/${complaintId}`);
        setComplaint(response.data);
        setRemarks(response.data.remarks || ''); // Initialize remarks with existing data if available
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch complaint details');
        setLoading(false);
      }
    };

    fetchComplaintDetails();
  }, [complaintId]);
  // const handleClose = () => {
  //   navigate(-1); // Navigate back to the previous page
  // };
 const updateComplaintStatus = async (complaintId, status, remarks) => {
    try {
      const response = await fetch(`https://servicedeskadmin-v3.onrender.com/ServiceAdminEscalate/escalated/update/${complaintId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status, remarks }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Success: Complaint updated successfully');
        return data.complaint;
      } else {
        alert('Error: ' + (data.message || 'Failed to update complaint'));
        return null;
      }
    } catch (error) {
      console.error('Error updating complaint:', error.message);
      alert('Error: An error occurred while updating the complaint');
      return null;
    }
  };
  const handleComplete = async (complaintId,status, remarks) => {
    
    const updatedComplaint = await updateComplaintStatus(complaintId, status, remarks);
    if (updatedComplaint) {
      // Handle the updated complaint, e.g., update the UI or navigate back
      console.log('Complaint updated:', updatedComplaint);
    }
    navigate(-1); // Navigate back to the previous page
  };


  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }



  return (
    <div>
      <h1>Complaint Details</h1>
      <div className="complaint-details">
        {/* <button onClick={handleNavigation} style={{ marginTop: '20px', padding: '10px 20px' }}>
          Back
        </button> */}
        <button onClick={onClose}>Close</button>

        <h2>{complaint.complaint}</h2>
        <p><strong>Username:</strong> {complaint.username}</p>
        <p><strong>Department:</strong> {complaint.department}</p>
        <p><strong>Location:</strong> {complaint.location.toUpperCase()}</p>
        {complaint.assignedUnit ? (
          <p><strong>Assigned Unit:</strong> {complaint.assignedUnit}</p>
        ) : null}
      </div>

      <div className="remarks-section">
        
        {/* Show the remark as plain text if the complaint is resolved or has an existing remark */}
        {complaint.status === 'completed' || complaint.remarks ? (
          <p style={{ backgroundColor: '#f8f9fa', padding: '10px', borderRadius: '5px' }}>
            <strong>Remark:</strong> {complaint.remarks || remarks || 'No remarks provided.'}
          </p>
        ) : (
          // Show textarea only if the complaint isn't completed and has no existing remark
          <textarea
            placeholder="Enter your remarks here"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            rows="4"
            style={{ width: '100%', padding: '10px', margin: '10px 0' }}
          />
        )}
      </div>

      {/* Show "Complete" button only if the complaint isn't already completed */}
      {complaint.status !== 'completed' &&complaint.status !== 'resolved'&& (
        <button
          onClick={() => handleComplete(complaint._id, 'resolved', remarks)}
          style={{
            padding: '10px 20px',
            backgroundColor: 'green',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          Resolve
        </button>
        
        
      )}
    </div>
  );
};

export default ComplaintDetailsScreen;
