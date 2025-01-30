import React, { useEffect, useState } from 'react';
import './App.css';
import axios from 'axios';
// import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import {Button} from "@heroui/react";


function App() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState('New');
  const [totalPages, setTotalPages] = useState(0);
  const itemsPerPage = 10;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEscalateModalOpen, setIsEscalateModalOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [selectedUnit, setSelectedUnit] = useState('');
  const [complaint, setComplaint] = useState('');
  const [userDetails, setUserDetails] = useState({
    name: '',
    contact:'',
    location:'',
    department:'',
  });

  // Simulate fetching user details from a backend or storage
  useEffect(() => {
    // Replace this with a real API call or async storage fetch
    const username ='';
    const contact ='';
    const location='';
    const department='';
    const fetchUserDetails = () => {
      setUserDetails({
        name: username,
        contact:contact,
        location:location,
        department:department,
      });
    };
    fetchUserDetails();
  }, []);
 
  // const navigate = useNavigate();

  // const handleNavigation = () => {
  //   navigate('/another-screen');
  // };

  const fetchComplaints = async (page = 1, status = 'All') => {
    setLoading(true);
    try {
      const response = await axios.get('https://servicedeskadmin-v3.onrender.com:5000/Greports_2', {
        params: {
          page,
          limit: itemsPerPage,
          status: status !== 'All' ? status.toLowerCase() : undefined,
        },
      });
      setComplaints(response.data.complaints);
      setTotalPages(response.data.totalPages);
    } catch (err) {
      setError('Failed to fetch complaints.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints(currentPage, filterStatus);
  }, [currentPage, filterStatus]);

  const updateComplaintStatus = async (id, newStatus) => {
    try {
      await axios.put(`https://servicedeskadmin-v3.onrender.com:5000/Greports/update-status/${id}`, {
        status: newStatus,
      });
      alert(`Status updated to ${newStatus}`);
      fetchComplaints(currentPage, filterStatus);
    } catch (err) {
      alert('Failed to update status.');
    }
  };

  const verifyReport = async (id) => {
    try {
      const response = await axios.put(`https://servicedeskadmin-v3.onrender.com:5000/reports/verify/${id}`);
      alert(response.data.message);
      await updateComplaintStatus(id, 'completed');
    } catch (error) {
      console.error('Error verifying report:', error);
      alert('Failed to verify the report.');
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  if (loading) {
    return     <Button
    isLoading
    color="secondary"
    spinner={
      <svg
        className="animate-spin h-5 w-5 text-current"
        fill="none"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          fill="currentColor"
        />
      </svg>
    }
  >
    Loading
  </Button>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }
  const filteredComplaints = complaints.filter((complaint) => {
    if (filterStatus === 'Resolved') {
      return complaint.status.toLowerCase() === 'resolved' && !complaint.verified;
    }
    if (filterStatus === 'Completed') {
      return complaint.status.toLowerCase() === 'completed' && complaint.verified;
    }
    if (filterStatus === 'All') {
      return true; // Show all complaints for "All"
    }
    return complaint.status.toLowerCase() === filterStatus.toLowerCase();
  });
  
  

 



  // Handle complaint submission
  const handleSubmit = async () => {
    const endpoint = 'http://172.26.4.64:3000/reports'; // Replace with your backend's actual URL
    const username = userDetails.name ;
    const contact = userDetails.contact;
    const location=userDetails.location.toUpperCase();
    const department=userDetails.department;

    const payload = {
      username,
      complaint,
      department,
      location,
      contact,
    };
    console.log('Payload:', payload);

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
       
        const errorDetails = await response.text();
        console.error(`Error: ${response.status} - ${errorDetails}`);
        throw new Error(errorDetails || `Error: ${response.status}`);
      }

      const data = await response.json();
      console.log('Complaint submitted successfully:', data);
      setComplaint('');
      alert('Complaint submitted successfully!');
    } catch (error) {
      console.error('Failed to submit complaint:', error.message);
      alert('Failed to submit complaint. Please try again.');
    }
  };

  const handleEscalate = (complaint) => {
    setSelectedComplaint(complaint);
    setSelectedUnit('');
    setIsEscalateModalOpen(true);
  };
  const handleEscalateSubmit = async () => {
    if (!selectedUnit) {
      alert('Please select a unit');
      return;
    }

    try {
      await axios.post(`http://172.26.4.64:3000/api/reports/${selectedComplaint._id}/assign`, {
        assignedUnit: selectedUnit,
      });
      alert('Assigned unit updated successfully');
      setIsEscalateModalOpen(false);
      fetchComplaints(currentPage, filterStatus);
    } catch (err) {
      alert('Failed to update assigned unit.');
    }
  };
  const handleEscalateAndUpdateStatus = async () => {
    await handleEscalateSubmit();
    await updateComplaintStatus(selectedComplaint._id, 'escalated');
  };
  return (
    <div className="App">
      <h1>Service Desk</h1>
      {/* <button onClick={handleNavigation} style={{ marginTop: '20px', padding: '10px 20px' }}>
        See Escalated Complaints
      </button> */}
      <button
        style={{ margin: '1rem 0', padding: '10px 20px' }}
        onClick={() => setIsModalOpen(true)}
      >
        New Complaint
      </button>
      <hr />
      <div className="filter-buttons">
        {['New', 'All', 'Escalated','Resolved', 'Completed'].map((status) => (
          <button
            key={status}
            onClick={() => {
              setFilterStatus(status);
              setCurrentPage(1);
            }}
            className={filterStatus === status ? 'active' : ''}
            >
            {status}
            </button>
          ))}
          </div>
          <div className="card-container">{
          <table>
            <thead>
            <tr>
              <th>Complaint</th>
              {filterStatus ==='All'&&<th>Status</th>}
              <th>Location</th>
              <th>User</th>
              <th>Contact</th>
              {<th>Submitted</th>}
              
              {filterStatus !== 'New' &&filterStatus !== 'Escalated'&& filterStatus !== 'Completed'&&filterStatus !== 'Resolved'&& <th>Escalated</th>} 
              {filterStatus !== 'New' &&filterStatus !== 'Escalated'&&<th>Resolved At</th>}
              {filterStatus !== 'Escalated'&&filterStatus !== 'Completed'&&<th>Actions</th>}
              {filterStatus !== 'Escalated'&&filterStatus !== 'New'&&filterStatus !== 'Resolved'&& filterStatus !== 'Completed'&&<th>Verification</th>}
            </tr>
            </thead>
            <tbody>
            {filteredComplaints.map((complaint) => (
              <tr key={complaint._id}>
              <td>
                {complaint.status === 'escalated' ? (
                complaint.complaint
                ) : (
                <Link to={`/complaint-details/${complaint._id}`}>
                  <span style={{ color: 'blue', textDecoration: 'underline', cursor: 'pointer' }}>
                  {complaint.complaint}
                  </span>
                </Link>
                )}
              </td>
              {filterStatus ==='All'&&<td>{complaint.status}</td>}

              <td>{complaint.location.toUpperCase()}</td>
              <td>{complaint.username}</td>
              <td>{complaint.contact}</td>
              {<td>{new Date(complaint.createdAt).toLocaleString()}</td>}
             
               
              {filterStatus !== 'New' && filterStatus !== 'Escalated'&&filterStatus !== 'Completed'&&filterStatus !== 'Resolved'&&
              <td>
                {
                new Date(complaint.EscalatedAt).toLocaleString()
                 }
              </td>
            }
              {filterStatus !== 'New' &&filterStatus !== 'Escalated'&& 
              <td>
                {
                new Date(complaint.resolvedAt).toLocaleString()}
                
              </td>
              }
              {/* action buttons */}
              {filterStatus !== 'Escalated'&&filterStatus !== 'Completed'&&<td>
                  {complaint.status !== 'resolved' && complaint.status !== 'escalated' &&complaint.status !=='redo'&&complaint.status !== 'completed' && (
                    <button onClick={() => handleEscalate(complaint)}>Escalate</button>
                  )}
                  {complaint.status === 'resolved' && !complaint.verified && (
                    <button onClick={() => verifyReport(complaint._id)}>Verify</button>
                  )}<br />
                  {complaint.status === 'resolved' &&!complaint.verified  && (
                    <button onClick={() => updateComplaintStatus(complaint._id, 'redo')}>Redo</button>
                  )}
                </td>}
              {filterStatus !== 'Escalated'&&filterStatus !== 'New'&&filterStatus !== 'Resolved'&& filterStatus !== 'Completed'&&<td>
  {complaint.verified ? (
    <span style={{ color: 'green', fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="green"
        width="20"
        height="20"
        style={{ marginRight: '5px' }}
      >
        <path
          fillRule="evenodd"
          d="M16.707 5.293a1 1 0 010 1.414l-8.25 8.25a1 1 0 01-1.414 0l-4.25-4.25a1 1 0 111.414-1.414L8 12.086l7.293-7.293a1 1 0 011.414 0z"
          clipRule="evenodd"
        />
      </svg>
      Verified
    </span>
  ) : (
    <span style={{ color: 'red', fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="red"
        width="20"
        height="20"
        style={{ marginRight: '5px' }}
      >
        <path
          fillRule="evenodd"
          d="M10 9a1 1 0 011 1v4a1 1 0 11-2 0v-4a1 1 0 011-1zm.707-5.707a1 1 0 00-1.414 0L3.293 10.293a1 1 0 101.414 1.414L10 6.414l5.293 5.293a1 1 0 001.414-1.414L10.707 3.293z"
          clipRule="evenodd"
        />
      </svg>
      Pending 
    </span>
  )}
</td>}   
              </tr>
            ))}
          </tbody>
        </table>}
        <div className="pagination">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          {Array.from({ length: totalPages }, (_, index) => (
            <button
              key={index + 1}
              onClick={() => handlePageChange(index + 1)}
              className={currentPage === index + 1 ? 'active' : ''}
            >
              {index + 1}
            </button>
          ))}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      </div>
      {isModalOpen && (
  <div className="modal">
    <div className="modal-content">
      <h2>New Report</h2>
      <form>
        <input
          name="complaint"
          placeholder="complaint"
          value={complaint}
          onChange={(e) => setComplaint(e.target.value)}
          required
        />
        <select
          name="department"
          value={userDetails.department}
          onChange={(e) => setUserDetails({ ...userDetails, department: e.target.value })}
          required
        >
          <option value="">Select Department</option>
          <option value="MIS">MIS</option>
          <option value="LEGAL">LEGAL</option>
          <option value="FINANCE">FINANCE</option>
          <option value="PROCUREMENT">PROCUREMENT</option>
          <option value="CORPORATE COMMS">CORPORATE COMMS</option>
          <option value="REAL ESTATE">REAL ESTATE</option>
          <option value="TRANSPORT">TRANSPORT</option>
        </select>
        <select
          name="location"
          value={userDetails.location}
          onChange={(e) => setUserDetails({ ...userDetails, location: e.target.value })}
          required
        >
          <option value="">Select Location</option>
          <option value="AKUSE">AKUSE</option>
          <option value="ACCRA">ACCRA</option>
          <option value="AKOSSOMBO">AKOSSOMBO</option>
          <option value="ABOADZE">ABOADZE</option>
          <option value="TEMA">TEMA</option>
        </select>
        <input
          name="username"
          placeholder="Username"
          value={userDetails.username}
          onChange={(e) => setUserDetails({ ...userDetails, name: e.target.value })}
          required
        />
        <input
          name="contact"
          placeholder="Contact"
          value={userDetails.contact}
          onChange={(e) => setUserDetails({ ...userDetails, contact: e.target.value })}
          required
        />
        <button onClick={handleSubmit}>Submit</button>
        <button
          type="button"
          onClick={() => setIsModalOpen(false)}
          style={{ marginLeft: '10px' }}
        >
          Cancel
        </button>
      </form>
    </div>
  </div>
)}
      {isEscalateModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h2>Escalate Complaint</h2>
            <form>
              <label htmlFor="unit">Select Unit:</label>
              <select
                id="unit"
                value={selectedUnit}
                onChange={(e) => setSelectedUnit(e.target.value)}
                required
              >
                <option value="">Select a unit</option>
                <option value="ICTI_Communications">ICTI_Communications</option>
                <option value="ICTI_Network">ICTI_Network</option>
                <option value="ICTI_Operations">ICTI_Operations</option>
                <option value="BS_E-Business Support">BS_E-Business Support</option>
                <option value="BS_DBA">BS_DBA</option>
                <option value="BS_SDI">BS_SDI</option>
                <option value="BS_SoftwareSupport">BS_SoftwareSupport</option>
                <option value="CST_Hardware">CST_Hardware</option>
              </select>
              <button type="button" onClick={handleEscalateAndUpdateStatus}>
                Escalate
              </button>
              <button
                type="button"
                onClick={() => setIsEscalateModalOpen(false)}
                style={{ marginLeft: '10px' }}
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
