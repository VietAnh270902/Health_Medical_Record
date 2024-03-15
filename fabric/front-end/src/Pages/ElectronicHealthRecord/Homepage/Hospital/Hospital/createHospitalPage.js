import React, { useState } from 'react';
import HospitalPageHeader from '../../Component/HospitalPageHeader';
import Footer from '../../Component/Footer';
import '../../../../CSS/Patient/PatientPage.css';
import '../../../../CSS/CreateAsset.css';
import { useUser } from '../../../Login/UserContext';

function CreateHospitalPage() { 
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [fabricMessage, setFabricMessage] = useState('');

  const handleCategorySelect = (category) => {
    if (selectedCategory === category) {
      setSelectedCategory(null);
    } else {
      setSelectedCategory(category);
    }
  };

  const [hospitalID, sethospitalID] = useState('');
  const [hospitalName, sethospitalName] = useState('');
  const [location, setLocation] = useState('');
  const [contactInfo, setcontactInfo] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { DateTime } = require('luxon');
  const timestamp = DateTime.now().toISO();
  const { user } = useUser();

  const handleSubmit = async (event) => {
    event.preventDefault();
  
    // Construct both API endpoints
    const fabricEndpoint = '/api/create-hospital-fabric';
    const mysqlEndpoint = '/api/create-hospital-mysql';
  
    try {
      // Send a request to create a patient in the Fabric backend
      const fabricResponse = await fetch(`http://localhost:3001${fabricEndpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password, hospitalID, hospitalName, location, contactInfo, createdBy: user.Username, timestamp }),
      });
  
      if (fabricResponse.ok) {
        setFabricMessage('Hospital created in Fabric successfully');
      } else {
        setFabricMessage('Failed to create Hospital in Fabric');
      }
  
      // Send a request to create a patient in the MySQL backend
      const mysqlResponse = await fetch(`http://localhost:3001${mysqlEndpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password, hospitalID, hospitalName, location, contactInfo, createdBy: user.Username, timestamp }),
      });
  
      if (mysqlResponse.ok) {
        console.log('Hospital created in MySQL successfully');
      } else {
        console.error('Failed to create Hospital in MySQL');
      }
    } catch (error) {
      console.error('Error creating Hospital:', error);
    }
  };  

  return (
    <div className="patient-page">
    <HospitalPageHeader onCategorySelect={handleCategorySelect} selectedCategory={selectedCategory} />
    <div className="create-asset-container">
      <h1>Create Hospital</h1>
      <form className="create-asset-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Hospital ID:</label>
          <input type="text" value={hospitalID} onChange={(e) => sethospitalID(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Hospital Name:</label>
          <input type="text" value={hospitalName} onChange={(e) => sethospitalName(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Location:</label>
          <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Contact Info:</label>
          <input type="text" value={contactInfo} onChange={(e) => setcontactInfo(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Username:</label>
          <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Password:</label>
          <input type="text" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <button type="submit" className="create-asset-button">Create Hospital</button>
      </form>
      {fabricMessage && <p className={fabricMessage.includes('successfully') ? 'success-message' : 'error-message'}>{fabricMessage}</p>}
    </div>
    <Footer />
  </div>
  );
}

export default CreateHospitalPage;
