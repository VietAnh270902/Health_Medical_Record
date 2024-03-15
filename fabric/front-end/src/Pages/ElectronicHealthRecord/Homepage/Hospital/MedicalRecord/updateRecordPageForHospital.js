import React, { useState } from 'react';
import HospitalPageHeader from '../../Component/HospitalPageHeader';
import Footer from '../../Component/Footer';
import '../../../../CSS/Patient/PatientPage.css';
import '../../../../CSS/UpdateAsset.css';
import { useUser } from '../../../Login/UserContext';

function UpdateRecordPageForHospital() {
  const [selectedCategory, setSelectedCategory] = useState(null);

  const handleCategorySelect = (category) => {
    if (selectedCategory === category) {
      setSelectedCategory(null);
    } else {
      setSelectedCategory(category);
    }
  };

  const [recordID, setrecordID] = useState('');
  const [patientID, setpatientID] = useState('');
  const [doctorID, setdoctorID] = useState('');
  const [hospitalID, sethospitalID] = useState('');
  const [date, setDate] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [treatment, setTreatment] = useState('');
  const [medications, setMedications] = useState('');
  const [notes, setNotes] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const { DateTime } = require('luxon');
  const timestamp = DateTime.now().toISO();
  const { user } = useUser();

  const handleSubmit = async (event) => {
    event.preventDefault();
  
    // Construct both API endpoints
    const fabricEndpoint = '/api/update-record-fabric';
    const mysqlEndpoint = '/api/update-record-mysql';
  
    try {
      // Send a request to update a patient in the Fabric backend
      const fabricResponse = await fetch(`http://localhost:3001${fabricEndpoint}`, {
        method: 'PUT', // Use PUT request for updating
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recordID,
          patientID,
          doctorID,
          hospitalID: user.UserID,
          date,
          diagnosis,
          treatment,
          medications,
          notes,
          username: user.Username, // Assuming you have user data available
          timestamp, // Include a timestamp
        }),
      });
  
      if (fabricResponse.ok) {
        console.log('Medical record updated in Fabric successfully');
      } else if (fabricResponse.status === 404) {
        console.error('The Medical record does not exist in Fabric');
      } else {
        console.error('Failed to update Medical record in Fabric');
      }
  
      // Send a request to update a patient in the MySQL backend
      const mysqlResponse = await fetch(`http://localhost:3001${mysqlEndpoint}`, {
        method: 'PUT', // Use PUT request for updating
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recordID,
          patientID,
          doctorID,
          hospitalID: user.UserID,
          date,
          diagnosis,
          treatment,
          medications,
          notes,
          username: user.Username, // Assuming you have user data available
          timestamp, // Include a timestamp
        }),
      });
  
      if (mysqlResponse.ok) {
        console.log('Medical Record updated in MySQL successfully');
      } else if (mysqlResponse.status === 404) {
        console.error('The Medical Record does not exist in MySQL');
      } else {
        console.error('Failed to update Medical Record in MySQL');
      }
    } catch (error) {
      console.error('Error updating Medical Record:', error);
    }
  };  

  return (
    <div className="hospital-page">
    <HospitalPageHeader onCategorySelect={handleCategorySelect} />
    <div className="update-asset-container">
      <h1>Update Medical Record</h1>
      <form onSubmit={handleSubmit} className="update-asset-form">
      <div className="form-group">
          <label>Record ID:</label>
          <input type="text" value={recordID} onChange={(e) => setrecordID(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Patient ID:</label>
          <input type="text" value={patientID} onChange={(e) => setpatientID(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Doctor ID:</label>
          <input type="text" value={doctorID} onChange={(e) => setdoctorID(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Date:</label>
          <input type="text" value={date} onChange={(e) => setDate(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Diagnosis:</label>
          <input type="text" value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Treatment:</label>
          <input type="text" value={treatment} onChange={(e) => setTreatment(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Medications:</label>
          <input type="text" value={medications} onChange={(e) => setMedications(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Notes:</label>
          <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} required />
        </div>
        <button type="submit" className="update-asset-button">Update Medical Record</button>
      </form>
      <p className="update-status-message">{message}</p>
    </div>
    <Footer />
  </div>
  );
}

export default UpdateRecordPageForHospital;