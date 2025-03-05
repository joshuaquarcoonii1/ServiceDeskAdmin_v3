import React, { useEffect, useState } from 'react';
import {  useNavigate } from 'react-router-dom';
import axios from 'axios';


const ComplaintDetailsScreen = ({ complaintId, onClose }) => {
  // const { complaintId } = useParams(); // Retrieve the complaint ID from the URL
  const navigate = useNavigate(); // For navigating back to the previous screen
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [remarks, setRemarks] = useState(''); // State for remarks
  const [selectedcategory,setselectedCategory]=useState('');
  
  const [isEditing, setIsEditing] = useState({
  category: false,
   
  });


  
  useEffect(() => {
    const fetchComplaintDetails = async () => {
      try {
        const response = await axios.get(`http://172.20.10.2:5000/ServiceAdminEscalate/escalated/${complaintId}`);
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
      const response = await fetch(`http://172.20.10.2:5000/ServiceAdminEscalate/escalated/update/${complaintId}`, {
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
    navigate('/dashboard'); // Navigate back to the previous page
  };


  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  const handleEditClick = async (field) => {
    if (isEditing[field] && field === 'category') {
      try {
        const response = await fetch(`http://172.20.10.2:5000/api/reports/${complaint._id}/assign`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ category: selectedcategory }),
        });
  
        if (!response.ok) {
          throw new Error('Failed to update category.');
        }
  
        const data = await response.json();
        console.log("Updated Report:", data.report); // Debugging
  
        // Update the complaint state with the new category
        setComplaint((prev) => ({ ...prev, category: data.report.category }));
  
        alert('Category updated successfully!');
      } catch (error) {
        console.error(error);
        alert('Failed to update category.');
      }
    }
  
    setIsEditing((prevEditing) => ({
      ...prevEditing,
      [field]: !prevEditing[field], // Toggle edit mode
    }));
  };
  

  return (
    <div className="modal">
      <div className="modal-content">
    <div>
      <h1>Complaint Details</h1>
      
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
        {complaint.level ? (
          <p><strong>Level:</strong> {complaint.level}</p>
        ) : null}
        {isEditing.category ? (
  <select
    id="category"
    value={selectedcategory}
    onChange={(e) => setselectedCategory(e.target.value)}
    required
  >
    <optgroup label="Technical Issues">
      <option value="">Select Category</option>
      <option value="Networking">Networking</option>
      <option value="Anti-Virus">Anti-Virus</option>
      <option value="Internet">Internet</option>
      <option value="Printing">Printing</option>
      <option value="Hardware">Hardware</option>
      <option value="System Software">System Software</option>
      <option value="Telephony Issues">Telephony Issues</option>
      <option value="Scanning">Scanning</option>
      <option value="MS Office Suite">MS Office Suite</option>
      <option value="Business Applications">Business Applications</option>
    </optgroup>
    <optgroup label="Service Request">
      <option value="Oracle Password Reset">Oracle Password Reset</option>
      <option value="Outlook Password Reset">Outlook Password Reset</option>
      <option value="New Account Set Up">New Account Set Up</option>
      <option value="VPN Connection">VPN Connection</option>
    </optgroup>
  </select>
) : (
  <p>
    <strong>Category:</strong> {complaint.category}
  </p>
)}<button onClick={() => handleEditClick('category')}>
  {isEditing.category ? 'Save' : 'Edit'}
</button>

      

      
        
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
    </div>
    </div>
  );
};

export default ComplaintDetailsScreen;
