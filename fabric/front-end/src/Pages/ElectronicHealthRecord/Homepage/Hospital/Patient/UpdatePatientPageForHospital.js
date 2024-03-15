import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useUser } from '../../../Login/UserContext';
import HospitalPageHeader from '../../Component/HospitalPageHeader';
import Footer from '../../Component/Footer';
import '../../../../CSS/Patient/PatientPage.css';
import '../../../../CSS/UpdateAsset.css'

function UpdatePatientPageForHospital() {
  const [selectedCategory, setSelectedCategory] = useState(null); 

  const handleCategorySelect = (category) => {
    if (selectedCategory === category) {
      setSelectedCategory(null);
    } else {
      setSelectedCategory(category);
    }
  };

  const { userID } = useParams(); // Access the userID parameter from the URL
  const [patientID, setpatientID] = useState('');
  const [firstName, setfirstName] = useState('');
  const [lastName, setlastName] = useState('');
  const [dateOfBirth, setdateOfBirth] = useState('');
  const [gender, setGender] = useState('');
  const [contactInfo, setcontactInfo] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const { user } = useUser();
  const { DateTime } = require('luxon');
  const timestamp = DateTime.now().toISO();

  const handleSubmit = async (event) => {
    event.preventDefault();
  
    // Construct both API endpoints
    const fabricEndpoint = '/api/update-patient-fabric';
    const mysqlEndpoint = '/api/update-patient-mysql';
  
    try {
      // Send a request to update a patient in the Fabric backend
      const fabricResponse = await fetch(`http://localhost:3001${fabricEndpoint}`, {
        method: 'PUT', // Use PUT request for updating
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patientID,
          firstName,
          lastName,
          dateOfBirth,
          gender,
          contactInfo,
          username: user.Username, // Assuming you have user data available
          timestamp, // Include a timestamp
        }),
      });
  
      if (fabricResponse.ok) {
        console.log('Patient updated in Fabric successfully');
      } else if (fabricResponse.status === 404) {
        console.error('The patient does not exist in Fabric');
      } else {
        console.error('Failed to update patient in Fabric');
      }
  
      // Send a request to update a patient in the MySQL backend
      const mysqlResponse = await fetch(`http://localhost:3001${mysqlEndpoint}`, {
        method: 'PUT', // Use PUT request for updating
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patientID,
          firstName,
          lastName,
          dateOfBirth,
          gender,
          contactInfo,
          username: user.Username, // Assuming you have user data available
          timestamp, // Include a timestamp
        }),
      });
  
      if (mysqlResponse.ok) {
        console.log('Patient updated in MySQL successfully');
      } else if (mysqlResponse.status === 404) {
        console.error('The patient does not exist in MySQL');
      } else {
        console.error('Failed to update patient in MySQL');
      }
    } catch (error) {
      console.error('Error updating patient:', error);
    }
  };  

  return (
  <div className="patient-page">
    <HospitalPageHeader onCategorySelect={handleCategorySelect} selectedCategory={selectedCategory} />
    <div className="update-asset-container">
      <h1>Update Patient</h1>
      <form onSubmit={handleSubmit} className="update-asset-form">
        <div className="form-group">
          <label>Patient ID:</label>
          <input type="text" value={patientID} onChange={(e) => setpatientID(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>First Name:</label>
          <input type="text" value={firstName} onChange={(e) => setfirstName(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Last Name:</label>
          <input type="text" value={lastName} onChange={(e) => setlastName(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Date of Birth:</label>
          <input type="text" value={dateOfBirth} onChange={(e) => setdateOfBirth(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Gender:</label>
          <input type="text" value={gender} onChange={(e) => setGender(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Contact Info:</label>
          <input type="text" value={contactInfo} onChange={(e) => setcontactInfo(e.target.value)} required />
        </div>
        <button type="submit" className="update-asset-button">Update Patient</button>
      </form>
      <p className="update-status-message">{message}</p>
    </div>
    <Footer />
  </div>
  );
}

export default UpdatePatientPageForHospital;