import React, { useState } from 'react';
import HospitalPageHeader from '../../Component/HospitalPageHeader.js';
import Footer from '../../Component/Footer.js';
import '../../../../CSS/CreateAsset.css';
import { useUser } from '../../../Login/UserContext';

function CreateDoctorPage() {
  const [selectedCategory, setSelectedCategory] = useState(null); 
  const [fabricMessage, setFabricMessage] = useState('');

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
  const [hospitalID, setHospitalID] = useState('');
  const [contactInfo, setcontactInfo] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { DateTime } = require('luxon');
  const timestamp = DateTime.now().toISO();
  const { user } = useUser();

  const handleSubmit = async (event) => {
    event.preventDefault();
  
    // Construct both API endpoints
    const fabricEndpoint = '/api/create-doctor-fabric';
    const mysqlEndpoint = '/api/create-doctor-mysql';
  
    try {
      // Send a request to create a patient in the Fabric backend
      const fabricResponse = await fetch(`http://localhost:3001${fabricEndpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password, doctorID, firstName, lastName, specialization, contactInfo, hospitalID, createdBy: user.Username, timestamp}),
      });
  
      if (fabricResponse.ok) {
        setFabricMessage('Doctor created in Fabric successfully');
      } else {
        setFabricMessage('Failed to create Doctor in Fabric');
      }
  
      // Send a request to create a patient in the MySQL backend
      const mysqlResponse = await fetch(`http://localhost:3001${mysqlEndpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password, doctorID, firstName, lastName, specialization, contactInfo, hospitalID, createdBy: user.Username, timestamp }),
      });
  
      if (mysqlResponse.ok) {
        console.log('Doctor created in MySQL successfully');
      } else {
        console.error('Failed to create Doctor in MySQL');
      }
    } catch (error) {
      console.error('Error creating patient:', error);
    }
  };  

  return (
    <div className="patient-page">
    <HospitalPageHeader onCategorySelect={handleCategorySelect} selectedCategory={selectedCategory} />
    <div className="create-asset-container">
      <h1>Create Doctor</h1>
      <form className="create-asset-form" onSubmit={handleSubmit}>
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
          <input type="text" value={hospitalID} onChange={(e) => setHospitalID(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Username:</label>
          <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Password:</label>
          <input type="text" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <button type="submit" className="create-asset-button">Create Doctor</button>
      </form>
      {fabricMessage && <p className={fabricMessage.includes('successfully') ? 'success-message' : 'error-message'}>{fabricMessage}</p>}
    </div>
    <Footer />
  </div>
  );
}

export default CreateDoctorPage;
