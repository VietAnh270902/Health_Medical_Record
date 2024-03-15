import React from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../../Login/UserContext';
import '../../../CSS/Patient/PatientPage.css';

const DoctorPageHeader = () => {
  const { user } = useUser();
  return (
    <div className="header">
      <Link className="dropdown-link" to="/doctor-homepage">Homepage</Link>
      
      <div className="dropdown">
        <a href="#">Patient</a>
        <div className="dropdown-content">
          <a><Link to={`/read-all-patients-page`}>View All Patients</Link></a>
          <a><Link to={`/read-patient-page`}>Search Patient</Link></a>
        </div>
      </div>

      <div className="dropdown">
        <a href="#">Doctor</a>
        <div className="dropdown-content">
          <a><Link to={`/view-doctor-profile/${user.UserID}`}>View My Profile</Link></a>
          <a><Link to={`/update-doctor-profile/${user.UserID}`}>Update My Profile</Link></a>
          <a><Link to={`/read-all-doctors-page`}>View All Doctor</Link></a>
          <a><Link to={`/read-doctor-page`}>Search Doctor</Link></a>
        </div>
      </div>

      <div className="dropdown">
        <a href="#">Medical Record</a>
        <div className="dropdown-content">
          <a><Link to={`/search-patient-records`}>Read Patient Medical Records</Link></a>
          <a><Link to={`/create-record-page`}>Create Patient Medical Records</Link></a>
          <a><Link to={`/update-record-page`}>Update Patient Medical Records</Link></a>
        </div>
      </div>

      <div className="dropdown">
        <a href="#">Hospital</a>
        <div className="dropdown-content">
          <a><Link to={`/read-all-hospitals-for-doctor`}>View All Hospital</Link></a>
          <a><Link to={`/read-hospital-page-for-doctor`}>Search Hospital</Link></a>
        </div>
      </div>

      <div className="dropdown">
        <a href="#">Account</a>
        <div className="dropdown-content">
          <a><Link to={`/update-doctor-account/${user.UserID}`}>Forgot Password</Link></a>
        </div>
      </div>

      <div className="welcome-message">
        Welcome, {user.UserType} {user.Username}
      </div>

      <div className="log-out">
        <button className="btn-log-out"><a><Link className="log-out-link" to={`/`}>Log Out</Link></a></button>
      </div>
    </div>
  );
};

export default DoctorPageHeader;




