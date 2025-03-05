import React, { useEffect, useState,Button } from 'react';
import './App.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {Spinner} from "@heroui/react";
import Tooltip from '@mui/material/Tooltip';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import Snackbar from '@mui/material/Snackbar';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Alert from '@mui/material/Alert';

// import { Link } from 'react-router-dom';
// import {Button} from "@heroui/react";
import ComplaintDetailsScreen from './screens/ComplaintsDetailsScreen/ComplaintDetails';
// import {Skeleton} from "@heroui/skeleton";
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
  const [totalComplaints, setTotalComplaints] = useState(0);
  const [complaintsLast24Hours, setComplaintsLast24Hours] = useState(0);
  const[complaintforModal, setComplaintforModal]=useState(null);
  const[selectedLevel, setSelectedLevel]=useState('');
  const [selectedcategory,setselectedCategory]=useState('');
  const [selectedPriority,setSelectedPriority]=useState('');
  const [selectedImpact,setSelectedImpact]=useState('');
  const [snackopen, setsnackOpen] = useState(false);
  const [userDetails, setUserDetails] = useState({
    name: '',
    contact:'',
    location:'',
    department:'',
  });
 const handlesnackClick = () => {
    setsnackOpen(true);
  };
  const handlesnackClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setsnackOpen(false);
  };
    const action = (
    <React.Fragment>
     
      <IconButton
        size="small"
        aria-label="close"
        color="inherit"
        onClick={handlesnackClose}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    </React.Fragment>
  );
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
      const response = await axios.get('http://172.20.10.2:5000/Greports_2', {
        params: {
          page,
          limit: itemsPerPage,
          status: status !== 'All' ? status.toLowerCase() : undefined,
        },
      });
      setComplaints(response.data.complaints);
      setTotalPages(response.data.totalPages);
      setTotalComplaints(response.data.complaints.length);
  
      const now = new Date();
      const complaintsInLast24Hours = response.data.complaints.filter(complaint => {
        const complaintDate = new Date(complaint.createdAt);
        return (now - complaintDate) / (1000 * 60 * 60) <= 8;
      });
      setComplaintsLast24Hours(complaintsInLast24Hours.length);
    } catch (err) {
      setError('Failed to fetch complaints.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints(currentPage, filterStatus);
  }, [currentPage, filterStatus]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchComplaints(currentPage, filterStatus);
    }, 12000000); // Refresh every 60 seconds

    return () => clearInterval(interval); // Cleanup interval on component unmount
  }, [currentPage, filterStatus]);



  const updateComplaintStatus = async (id, newStatus) => {
    try {
      await axios.put(`http://172.20.10.2:5000/Greports/update-status/${id}`, {
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
      const response = await axios.put(`http://172.20.10.2:5000/reports/verify/${id}`);
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
const calculateEscalatedHours = (escalatedAt) => {
  if (!escalatedAt) return 'N/A';

  const timeDiff = (Date.now() - new Date(escalatedAt).getTime()) / (1000 * 60 * 60);
  return timeDiff > 24
    ? `${Math.floor(timeDiff / 24)}d ${Math.floor(timeDiff % 24)}h`
    : `${Math.floor(timeDiff)}h`;
};

  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear any authentication tokens or user data
    // Redirect to the login page
    navigate('/login');
  };
  const handleOpenModal = (complaintId) => {
    setComplaintforModal(complaintId);
  };

  const handleCloseModal = () => {
    setComplaintforModal(null);
  };

  if (loading)   return  <Box sx={{ display: 'flex' }}>
  <CircularProgress size="3rem"/>
</Box>;

  

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

    const endpoint = 'http://172.20.10.2:5000/reports'; // Replace with your backend's actual URL
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
      handlesnackClick();

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
    setSelectedLevel('');
    setIsEscalateModalOpen(true);
  };
  const handleEscalateSubmit = async () => {
    if (!selectedUnit) {
      alert('Please select a unit');
      return;
    }else if(!selectedLevel){
      alert('Please select a level');
    }

    try {
      await axios.post(`http://172.20.10.2:5000/api/reports/${selectedComplaint._id}/assign`, {
        assignedUnit: selectedUnit,
        level: selectedLevel,
        category:selectedcategory
      });
      alert('Assigned unit , level and category updated successfully');
      setIsEscalateModalOpen(false);
      fetchComplaints(currentPage, filterStatus);
    } catch (err) {
      alert('Failed to update assigned unit.');
    }
  };
  const priority = async (selectedPriority, selectedImpact) => {
    try {
      const response = await fetch(`http://172.20.10.2:5000/api/reports/${complaint._id}/urgency`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priority: selectedPriority, impact: selectedImpact }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to escalate complaint.');
      }
  
      const data = await response.json();
      console.log("Priority set for Report:", data.report); // Debugging
  
      // Update the complaint state with new priority, impact, and urgency
      setComplaint((prev) => ({
        ...prev,
        priority: data.report.priority,
        impact: data.report.impact,
        urgency: data.report.urgency,
      }));
  
      alert('Complaint urgency set successfully!');
    } catch (error) {
      console.error(error);
      alert('Failed to set urgency for complaint.');
    }
  };
  
  const handleEscalateAndUpdateStatus = async () => {
    await handleEscalateSubmit();
    await updateComplaintStatus(selectedComplaint._id, 'escalated');
    await priority(selectedPriority, selectedImpact);
  };
  


  return (
    <div className="App">
      <h1>Service Desk</h1>
      <button onClick={handlesnackClick} style={{ marginTop: '20px', padding: '10px 20px' }}>
        See Escalated Complaints
      </button>
      <div className="counters">
        <p>Total Complaints: {totalComplaints}</p>
        <p>New Complaints in Last 8 Hours: {complaintsLast24Hours}</p>
      </div>
      <Tooltip title="Click to manually add a new complaint" arrow> <button
        style={{ margin: '1rem 0', padding: '10px 20px' }}
        onClick={() => setIsModalOpen(true)}
      >
        New Complaint
      </button></Tooltip>
      <Tooltip title="Click to Log Out" arrow><button onClick={handleLogout} className="logout-button">Logout</button></Tooltip>

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
              {filterStatus !== 'New' && filterStatus !== 'Completed'&&filterStatus !== 'Resolved'&&filterStatus !== 'All'&&<th>Escalated For</th>}
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
                
                  <span style={{ color: 'blue', textDecoration: 'underline', cursor: 'pointer' }} onClick={() => handleOpenModal(complaint._id)}>
                  {complaint.complaint}
                  </span>
                
                )}
              </td>
              {filterStatus ==='All'&&<td>{complaint.status}</td>}

              <td>{complaint.location.toUpperCase()}</td>
              <td>{complaint.username}</td>
              <td>{complaint.contact}</td>
              <td>{new Date(complaint.createdAt).toLocaleString('en-US', { day: 'numeric', month: 'short', hour: 'numeric', minute: 'numeric', hour12: true })}</td>             
                 {filterStatus === 'Escalated' && (
                <td>{calculateEscalatedHours(complaint.EscalatedAt)} hours</td>
              )}
              {filterStatus !== 'New' && filterStatus !== 'Escalated'&&filterStatus !== 'Completed'&&filterStatus !== 'Resolved'&&
              <td>
                {
                new Date(complaint.EscalatedAt).toLocaleString('en-US', { day: 'numeric', month: 'short', hour: 'numeric', minute: 'numeric', hour12: true })
                 }
              </td>
            }
              {filterStatus !== 'New' &&filterStatus !== 'Escalated'&& 
              <td>
                {
                new Date(complaint.resolvedAt).toLocaleString('en-US', { day: 'numeric', month: 'short', hour: 'numeric', minute: 'numeric', hour12: true })}
                
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
    <span style={{ color: 'green', fontWeight: 'bold' }}>
      ✅ Verified
    </span>
  ) : (
    <span style={{ color: 'red', fontWeight: 'bold' }}>
      ❌ Pending
    </span>
  )}
</td>}   
              </tr>
            ))}
          </tbody>
        </table>}
        {complaintforModal && (
        <ComplaintDetailsScreen
          complaintId={complaintforModal}
          onClose={handleCloseModal}
        />
      )}
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
      <h2>New Complaint</h2>
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
          <option value="AUD">Internal Audit (AUD)</option>
<option value="BSEC">Board Secretariat (BSEC)</option>
<option value="CMD">Commercial Services (CMD)</option>
<option value="CSD">Corporate Strategy (CSD)</option>
<option value="CA&ER">Corporate Affairs & External Relations unit (CA&ER)</option>
<option value="ESD">Engineering Services (ESD)</option>
<option value="FIN">Finance & Investment (FIN)</option>
<option value="ESD">Environment & Sustainable (ESD)</option>
<option value="HRD">Human Resources (HRD)</option>
<option value="HGD">Hydro Generation (HGD)</option>
<option value="LSD">Legal Services (LSD)</option>
<option value="MIS">Management Information Systems (MIS)</option>
<option value="PRD">Procurement (PRD)</option>
<option value="REESD">Real Estates & Security Services (REESD)</option>
<option value="TSD">Technical Services (TSD)</option>
<option value="TGD">Thermal Generation (TGD)</option>
<option value="WR&RE">Water Resources & Renewables (WR&RE)</option>
<option value="UTIL">Utilities (UTIL)</option>
<option value="SP&NB">Special Projects & New Business (SP&NB)</option>
<option value="ACAD">VRA Academy (ACAD)</option>
<option value="VHSL">VRA Health Services Ltd. (VHSL)</option>
<option value="VISL">VRA Intl. School (VISL)</option>
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
          <option value="AKOSOMBO">AKOSOMBO</option>
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
        <button  onClick={handleSubmit}>Submit</button>
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
              <label htmlFor="level">Select Category:</label>
              <select
              id="category"
              value={selectedcategory}
              onChange={(e) => setselectedCategory(e.target.value)}
                required>
                
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
<option value="Business Applications">Business Applications</option></optgroup>
<optgroup label="Service Request">
    <option value="Oracle Password Reset">Oracle Password Reset</option>
    <option value="Outlook Password Reset">Outlook Password Reset</option>
    <option value="New Account Set Up">New Account Set Up</option>
    <option value="VPN Connection">VPN Connection</option>
  </optgroup>

              </select>
              <label htmlFor="level">Select Level:</label>
              <select
              id="level"
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
                required>
                <option value="">Select a level</option>
<option value="Level 2">Level 2</option>
<option value="Level 3">Level 3</option>
              </select>
              <label htmlFor="level">Select Priority :</label>
              <select onChange={(e) => setSelectedPriority(Number(e.target.value))}>
  <option value="1">1 (Lowest)</option>
  <option value="2">2</option>
  <option value="3">3</option>
  <option value="4">4</option>
  <option value="5">5 (Highest)</option>
</select>
<label htmlFor="level">Select Impact:</label>
<select onChange={(e) => setSelectedImpact(Number(e.target.value))}>
  <option value="1">1 (Low Impact)</option>
  <option value="2">2</option>
  <option value="3">3</option>
  <option value="4">4</option>
  <option value="5">5 (High Impact)</option>
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
      <Snackbar open={snackopen} autoHideDuration={6000} onClose={handlesnackClose}>
        <Alert
          onClose={handlesnackClose}
          severity="success"
          variant="filled"
          sx={{ width: '100%' }}
        >
          Complaint Added Successfully
        </Alert>
      </Snackbar>
    </div>
  );
}

export default App;
