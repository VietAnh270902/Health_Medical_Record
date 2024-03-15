import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from './UserContext';
import '../../CSS/Login/login.css';

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [userType, setUserType] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { updateUser } = useUser();

    const handleLogin = async () => {
        try {
            // Send a GET request to authenticate the user
            const response = await fetch(`http://localhost:3001/api/login?username=${username}&password=${password}&userType=${userType}`);

            if (response.ok) {
                // Authentication successful
                const data = await response.json();
                console.log('User authenticated:', data);
                setError('');

            // Update user context
            updateUser(data);

            // Redirect based on user type
            if (data.UserType === 'patient') {
                // Assuming you have a route defined for PatientPage in App.js
                navigate('/patient-homepage');
            } else if (data.UserType === 'doctor') {
                // Redirect to other pages based on user type as needed
                navigate('/doctor-homepage');
            } else if (data.UserType === 'hospital') {
                // Redirect to other pages based on user type as needed
                navigate('/hospital-homepage');
            } 
            } else {
                // Authentication failed
                setError('Authentication failed');
            }
        } catch (error) {
            console.error(`Failed to authenticate user: ${error}`);
            setError('Authentication failed');
        }
    };

    return (
        <div className="login-page">
        <div className="background"></div>
        <div className="container">
            <h1>Login</h1>
            <div>
                <label>Username:</label>
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
            </div>
            <div>
                <label>Password:</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <div>
                <label>User Type:</label>
                <select value={userType} onChange={(e) => setUserType(e.target.value)} required>
                    <option value="">Select user type</option>
                    <option value="patient">Patient</option>
                    <option value="doctor">Doctor</option>
                    <option value="hospital">Hospital</option>
                </select>
            </div>
            <button onClick={handleLogin}>Login</button>
            {error && <p className="error">{error}</p>}
        </div>
        </div>
    );
}

export default Login;




