import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './EscalatedComplaintsScreen.css';
import { Link } from 'react-router-dom';

const EscalatedComplaintsScreen = () => {
  const [complaints, setComplaints] = useState([]);
  const [filteredComplaints, setFilteredComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState('All');

  useEffect(() => {
    const fetchEscalatedComplaints = async () => {
      try {
        const response = await axios.get('https://servicedeskadmin-v3.onrender.com/ServiceAdminEscalate/escalated');
        setComplaints(response.data);
         setFilteredComplaints(response.data);// Initialize with all complaints
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch complaints');
        setLoading(false);
      }
    };

    fetchEscalatedComplaints();
  }, []);


  
  const handleLocationChange = (location) => {
    setSelectedLocation(location);
    if (location === 'All') {
      setFilteredComplaints(complaints);
    } else {
      const filtered = complaints.filter((complaint) => complaint.location === location);
      setFilteredComplaints(filtered);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="complaints-container">
      <h1> Client Services</h1>

      {/* Filter Dropdown */}
      <div className="filter-container">
        <label htmlFor="location-filter">Filter by Location:</label>
        <select
          id="location-filter"
          value={selectedLocation}
          onChange={(e) => handleLocationChange(e.target.value)}
        >
          <option value="All">All</option>
          <option value="AKOSSOMBO">AKOSSOMBO</option>
          <option value="ACCRA">ACCRA</option>
          <option value="AKUSE">AKUSE</option>
          <option value="TEMA">TEMA</option>
          <option value="ABOADZE">ABOADZE</option>
        </select>
      </div>

      {/* Complaints Cards */}
      {filteredComplaints.length === 0 ? (
        <p>No escalated complaints found for {selectedLocation}.</p>
      ) : (
        <div className="complaints-cards">
          {filteredComplaints.map((complaint) => (
            <div className="complaint-card" key={complaint._id}>
              <Link to={`/complaint-details/${complaint._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <h2>{complaint.complaint}</h2>
                <p><strong>Username:</strong> {complaint.username}</p>
                <p><strong>Department:</strong> {complaint.department}</p>
                {/* <p><strong>Location:</strong> {complaint.location}</p> */}
                <p><strong>Assigned Unit:</strong> {complaint.assignedUnit}</p>
                {/* Add the label for redo status */}
                {complaint.status === "redo" && (
                  <span className="redo-label">Redo</span>
                  
                )}
                {complaint.status === 'redo' && (
        <p><strong>Sent back:</strong> {complaint.redoCount} time(s)</p>
      )}
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EscalatedComplaintsScreen;
