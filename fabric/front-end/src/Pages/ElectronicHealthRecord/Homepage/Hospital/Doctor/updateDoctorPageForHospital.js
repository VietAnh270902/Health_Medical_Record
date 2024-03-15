import React, { useState } from 'react';
import HospitalPageHeader from '../../Component/HospitalPageHeader';
import Footer from '../../Component/Footer';
import '../../../../CSS/Patient/PatientPage.css';
import '../../../../CSS/UpdateAsset.css'
import { useUser } from '../../../Login/UserContext';

function UpdateDoctorPageForHospital() {
    const [selectedCategory, setSelectedCategory] = useState(null);

    const handleCategorySelect = (category) => {
        if (selectedCategory === category) {
        setSelectedCategory(null);
        } else {
        setSelectedCategory(category);
        }
    };

    const [doctorID, setdoctorID] = useState('');
    const [firstName, setfirstName] = useState('');
    const [lastName, setlastName] = useState('');
    const [specialization, setSpecialization] = useState('');
    const [contactInfo, setcontactInfo] = useState('');
    const [hospitalID, sethospitalID] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const { DateTime } = require('luxon');
    const timestamp = DateTime.now().toISO();
    const { user } = useUser();

    const handleSubmit = async (event) => {
      event.preventDefault();
    
      // Construct both API endpoints
      const fabricEndpoint = '/api/update-doctor-fabric';
      const mysqlEndpoint = '/api/update-doctor-mysql';
    
      try {
        // Send a request to update a patient in the Fabric backend
        const fabricResponse = await fetch(`http://localhost:3001${fabricEndpoint}`, {
          method: 'PUT', // Use PUT request for updating
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            doctorID,
            firstName,
            lastName,
            specialization,
            contactInfo,
            hospitalID,
            username: user.Username, // Assuming you have user data available
            timestamp, // Include a timestamp
          }),
        });
    
        if (fabricResponse.ok) {
          console.log('Doctor updated in Fabric successfully');
        } else if (fabricResponse.status === 404) {
          console.error('The doctor does not exist in Fabric');
        } else {
          console.error('Failed to update doctor in Fabric');
        }
    
        // Send a request to update a patient in the MySQL backend
        const mysqlResponse = await fetch(`http://localhost:3001${mysqlEndpoint}`, {
          method: 'PUT', // Use PUT request for updating
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            doctorID,
            firstName,
            lastName,
            specialization,
            contactInfo,
            hospitalID,
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
    <HospitalPageHeader onCategorySelect={handleCategorySelect} />
    <div className="update-asset-container">
      <h1>Update Doctor</h1>
      <form onSubmit={handleSubmit} className="update-asset-form">
        <div className="form-group">
          <label>Doctor ID:</label>
          <input type="text" value={doctorID} onChange={(e) => setdoctorID(e.target.value)} required />
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
          <label>Specialization:</label>
          <input type="text" value={specialization} onChange={(e) => setSpecialization(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Contact Info:</label>
          <input type="text" value={contactInfo} onChange={(e) => setcontactInfo(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Hospital ID:</label>
          <input type="text" value={hospitalID} onChange={(e) => sethospitalID(e.target.value)} required />
        </div>
        <button type="submit" className="update-asset-button">Update Doctor</button>
      </form>
      <p className="update-status-message">{message}</p>
    </div>
    <Footer />
  </div>
  );
}

export default UpdateDoctorPageForHospital;