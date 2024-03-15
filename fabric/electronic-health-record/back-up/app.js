/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Gateway, Wallets } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
const path = require('path');
const { buildCAClient, registerAndEnrollUser, enrollAdmin } = require('../../test-application/javascript/CAUtil.js');
const { buildCCPhospital, buildWallet } = require('../../test-application/javascript/AppUtil.js');

const channelName = 'mychannel';
const chaincodeName = 'hospital';
const msphospital = 'Hospital1MSP';
const walletPath = path.join(__dirname, 'wallet');
const hospitalUserId = 'Hospital1MSP';

function prettyJSONString(inputString) {
	return JSON.stringify(JSON.parse(inputString), null, 2);
}
async function main() {
	try {
		// build an in memory object with the network configuration (also known as a connection profile)
		const ccp = buildCCPhospital();

		// build an instance of the fabric ca services client based on
		// the information in the network configuration
		const caClient = buildCAClient(FabricCAServices, ccp, 'ca.hospital.example.com');

		// setup the wallet to hold the credentials of the application user
		const wallet = await buildWallet(Wallets, walletPath);

		// in a real application this would be done on an administrative flow, and only once
		await enrollAdmin(caClient, wallet, msphospital);

		// in a real application this would be done only when a new user was required to be added
		// and would be part of an administrative flow
		await registerAndEnrollUser(caClient, wallet, msphospital, hospitalUserId, 'hospital.department1');

		// Create a new gateway instance for interacting with the fabric network.
		// In a real application this would be done as the backend server session is setup for
		// a user that has been verified.
		const gateway = new Gateway();

		try {
			// setup the gateway instance
			// The user will now be able to create connections to the fabric network and be able to
			// submit transactions and query. All transactions submitted by this gateway will be
			// signed by this user using the credentials stored in the wallet.
			await gateway.connect(ccp, {
					wallet,
					identity: hospitalUserId,
					discovery: { enabled: true, asLocalhost: true }
				} // using asLocalhost as this gateway is using a fabric network deployed locally
			)
			console.log("============")
			// Build a network instance based on the channel where the smart contract is deployed
			const network = await gateway.getNetwork(channelName);

			// Get the contract from the network.
			const contract = network.getContract(chaincodeName);

			// Initialize a set of asset data on the channel using the chaincode 'InitLedger' function.
			// This type of transaction would only be run once by an application the first time it was started after it
			// deployed the first time. Any updates to the chaincode deployed later would likely not need to run
			// an "init" type function.
			console.log('\n--> Submit Transaction: InitLedger, function creates the initial set of assets on the ledger');
			await contract.submitTransaction('InitLedger');
			console.log('*** Result: committed');

			// Let's try a query type operation (function).
			// This will be sent to just one peer and the results will be shown.
			// Get All Patients
			console.log('\n--> Evaluate Transaction: GetAllPatients, function returns all the current assets on the ledger');
			let result = await contract.evaluateTransaction('GetAllPatients');
			console.log(`*** Result: ${prettyJSONString(result.toString())}`);

			// Get All Doctors
			console.log('\n--> Evaluate Transaction: GetAllDoctors, function returns all the current assets on the ledger');
			let result1 = await contract.evaluateTransaction('GetAllDoctors');
			console.log(`*** Result: ${prettyJSONString(result1.toString())}`);

			// Get All Hospitals
			console.log('\n--> Evaluate Transaction: GetAllHospitals, function returns all the current assets on the ledger');
			let result2 = await contract.evaluateTransaction('GetAllHospitals');
			console.log(`*** Result: ${prettyJSONString(result2.toString())}`);

			// Get All Medical ecords
			console.log('\n--> Evaluate Transaction: GetAllMedicalRecords, function returns all the current assets on the ledger');
			let result3 = await contract.evaluateTransaction('GetAllMedicalRecords');
			console.log(`*** Result: ${prettyJSONString(result3.toString())}`);

			// Get All Accounts
			console.log('\n--> Evaluate Transaction: GetAllAccounts, function returns all the current assets on the ledger');
			let result4 = await contract.evaluateTransaction('ReadAllAccounts');
			console.log(`*** Result: ${prettyJSONString(result4.toString())}`);

			// Get All Log Changes
			console.log('\n--> Evaluate Transaction: GetAllAccounts, function returns all the current assets on the ledger');
			let result5 = await contract.evaluateTransaction('GetAllLogChanges');
			console.log(`*** Result: ${prettyJSONString(result5.toString())}`);
			

			/*--- Server ---*/
			const express = require('express');
			const cors = require('cors');
			const app = express();
            const port = 3001; // or any port you prefer
			// Add a route to retrieve assets
            app.use(cors()); // Use the cors middleware to enable CORS

			// Login
			app.get('/api/login', async (req, res) => {
				const { username, password, userType } = req.query;
			
				try {
					// Build an in-memory object with the network configuration
					const ccp = buildCCPhospital();
			
					// Build an instance of the fabric CA services client
					const caClient = buildCAClient(FabricCAServices, ccp, 'ca.hospital.example.com');
			
					// Setup the wallet to hold the credentials of the application user
					const wallet = await buildWallet(Wallets, walletPath);
			
					const gateway = new Gateway();
					await gateway.connect(ccp, {
						wallet,
						identity: hospitalUserId,
						discovery: { enabled: true, asLocalhost: true }
					});
			
					// Build a network instance based on the channel where the smart contract is deployed
					const network = await gateway.getNetwork(channelName);
			
					// Get the contract from the network
					const contract = network.getContract(chaincodeName);
			
					// Call the smart contract function to authenticate the user
					const result = await contract.evaluateTransaction('AuthenticateUser', username, password, userType);
					const account = JSON.parse(result.toString());
			
					// Send the account data as JSON response
					res.status(200).json(account);
				} catch (error) {
					console.error(`Failed to authenticate user: ${error}`);
					res.status(401).json({ error: 'Authentication failed' });
				}
			});			

			// Get All Patients
			app.get('/api/patients', async (req, res) => {
				try {
					// build an in memory object with the network configuration (also known as a connection profile)
					const ccp = buildCCPhospital();

					// build an instance of the fabric ca services client based on
					// the information in the network configuration
					const caClient = buildCAClient(FabricCAServices, ccp, 'ca.hospital.example.com');

					// setup the wallet to hold the credentials of the application user
					const wallet = await buildWallet(Wallets, walletPath);

					const gateway = new Gateway();
					await gateway.connect(ccp, {
						wallet,
						identity: hospitalUserId,
						discovery: { enabled: true, asLocalhost: true } // using asLocalhost as this gateway is using a fabric network deployed locally
					});

					// Build a network instance based on the channel where the smart contract is deployed
					const network = await gateway.getNetwork(channelName);

					// Get the contract from the network.
					const contract = network.getContract(chaincodeName);

					// Query all assets
					const result = await contract.evaluateTransaction('GetAllPatients');
					const assets = JSON.parse(result.toString());
					res.setHeader('Content-Type', 'application/json'); // Set the Content-Type header
					res.json(assets);

                    console.log("Khong co loi gi !!!");
				} catch (error) {
				console.error(`Failed to fetch assets: ${error}`);
				res.status(500).json({ error: 'Failed to fetch assets' });
				console.log("Loi Roi !!!");
				}
			});
			
			app.listen(port, () => {
				console.log(`Server is running on port ${port}`);
			});

			// Get All Doctors
			app.get('/api/doctors', async (req, res) => {
				try {
					// build an in memory object with the network configuration (also known as a connection profile)
					const ccp = buildCCPhospital();

					// build an instance of the fabric ca services client based on
					// the information in the network configuration
					const caClient = buildCAClient(FabricCAServices, ccp, 'ca.hospital.example.com');

					// setup the wallet to hold the credentials of the application user
					const wallet = await buildWallet(Wallets, walletPath);

					const gateway = new Gateway();
					await gateway.connect(ccp, {
						wallet,
						identity: hospitalUserId,
						discovery: { enabled: true, asLocalhost: true } // using asLocalhost as this gateway is using a fabric network deployed locally
					});

					// Build a network instance based on the channel where the smart contract is deployed
					const network = await gateway.getNetwork(channelName);

					// Get the contract from the network.
					const contract = network.getContract(chaincodeName);

					// Query all assets
					const result = await contract.evaluateTransaction('GetAllDoctors');
					const assets = JSON.parse(result.toString());
					res.setHeader('Content-Type', 'application/json'); // Set the Content-Type header
					res.json(assets);

					console.log("Khong co loi gi !!!");
				} catch (error) {
				console.error(`Failed to fetch assets: ${error}`);
				res.status(500).json({ error: 'Failed to fetch assets' });
				console.log("Loi Roi !!!");
				}
			});

			// Get All Medical Records
			app.get('/api/records', async (req, res) => {
				try {
					// build an in memory object with the network configuration (also known as a connection profile)
					const ccp = buildCCPhospital();

					// build an instance of the fabric ca services client based on
					// the information in the network configuration
					const caClient = buildCAClient(FabricCAServices, ccp, 'ca.hospital.example.com');

					// setup the wallet to hold the credentials of the application user
					const wallet = await buildWallet(Wallets, walletPath);

					const gateway = new Gateway();
					await gateway.connect(ccp, {
						wallet,
						identity: hospitalUserId,
						discovery: { enabled: true, asLocalhost: true } // using asLocalhost as this gateway is using a fabric network deployed locally
					});

					// Build a network instance based on the channel where the smart contract is deployed
					const network = await gateway.getNetwork(channelName);

					// Get the contract from the network.
					const contract = network.getContract(chaincodeName);

					// Query all assets
					const result = await contract.evaluateTransaction('GetAllMedicalRecords');
					const assets = JSON.parse(result.toString());
					res.setHeader('Content-Type', 'application/json'); // Set the Content-Type header
					res.json(assets);

					console.log("Khong co loi gi !!!");
				} catch (error) {
				console.error(`Failed to fetch assets: ${error}`);
				res.status(500).json({ error: 'Failed to fetch assets' });
				console.log("Loi Roi !!!");
				}
			});

			// Get All Hospitals
			app.get('/api/hospitals', async (req, res) => {
				try {
					// build an in memory object with the network configuration (also known as a connection profile)
					const ccp = buildCCPhospital();

					// build an instance of the fabric ca services client based on
					// the information in the network configuration
					const caClient = buildCAClient(FabricCAServices, ccp, 'ca.hospital.example.com');

					// setup the wallet to hold the credentials of the application user
					const wallet = await buildWallet(Wallets, walletPath);

					const gateway = new Gateway();
					await gateway.connect(ccp, {
						wallet,
						identity: hospitalUserId,
						discovery: { enabled: true, asLocalhost: true } // using asLocalhost as this gateway is using a fabric network deployed locally
					});

					// Build a network instance based on the channel where the smart contract is deployed
					const network = await gateway.getNetwork(channelName);

					// Get the contract from the network.
					const contract = network.getContract(chaincodeName);

					// Query all assets
					const result = await contract.evaluateTransaction('GetAllHospitals');
					const assets = JSON.parse(result.toString());
					res.setHeader('Content-Type', 'application/json'); // Set the Content-Type header
					res.json(assets);

					console.log("Khong co loi gi !!!");
				} catch (error) {
				console.error(`Failed to fetch assets: ${error}`);
				res.status(500).json({ error: 'Failed to fetch assets' });
				console.log("Loi Roi !!!");
				}
			});

			// Get All Log Changes
			app.get('/api/logChanges', async (req, res) => {
				try {
					// build an in memory object with the network configuration (also known as a connection profile)
					const ccp = buildCCPhospital();

					// build an instance of the fabric ca services client based on
					// the information in the network configuration
					const caClient = buildCAClient(FabricCAServices, ccp, 'ca.hospital.example.com');

					// setup the wallet to hold the credentials of the application user
					const wallet = await buildWallet(Wallets, walletPath);

					const gateway = new Gateway();
					await gateway.connect(ccp, {
						wallet,
						identity: hospitalUserId,
						discovery: { enabled: true, asLocalhost: true } // using asLocalhost as this gateway is using a fabric network deployed locally
					});

					// Build a network instance based on the channel where the smart contract is deployed
					const network = await gateway.getNetwork(channelName);

					// Get the contract from the network.
					const contract = network.getContract(chaincodeName);

					// Query all assets
					const result = await contract.evaluateTransaction('GetAllLogChanges');
					const assets = JSON.parse(result.toString());
					res.setHeader('Content-Type', 'application/json'); // Set the Content-Type header
					res.json(assets);

					console.log("Khong co loi gi !!!");
				} catch (error) {
				console.error(`Failed to fetch assets: ${error}`);
				res.status(500).json({ error: 'Failed to fetch assets' });
				console.log("Loi Roi !!!");
				}
			});

			// Now let's try to submit a transaction.
			// This will be sent to both peers and if both peers endorse the transaction, the endorsed proposal will be sent
			// to the orderer to be committed by each of the peer's to the channel ledger.
			/*
			console.log('\n--> Submit Transaction: CreatePatient, creates new asset with ID, color, owner, size, and appraisedValue arguments');
			result = await contract.submitTransaction('CreatePatient', 'naruto', 'hinata', 'P003', 'Naruto', 'Uzumaki', '1999-10-10', 'Male', 'Konoha');
			console.log('*** Result: committed');
			if (`${result}` !== '') {
				console.log(`*** Result: ${prettyJSONString(result.toString())}`);
			}
			*/

			/*--- Server ---*/
			/* Create Patient */
            // ... (previous code)
			app.use(express.json());
			app.post('/api/create-patient-fabric', async (req, res) => {
				const { username, password, patientID, firstName, lastName, dateOfBirth, gender, contactInfo, createdBy, timestamp } = req.body;
				try {
                // build an in memory object with the network configuration (also known as a connection profile)
				const ccp = buildCCPhospital();

				// build an instance of the fabric ca services client based on
				// the information in the network configuration
				const caClient = buildCAClient(FabricCAServices, ccp, 'ca.hospital.example.com');

				// setup the wallet to hold the credentials of the application user
				const wallet = await buildWallet(Wallets, walletPath);

				const gateway = new Gateway();
				await gateway.connect(ccp, {
					wallet,
					identity: hospitalUserId,
					discovery: { enabled: true, asLocalhost: true } // using asLocalhost as this gateway is using a fabric network deployed locally
				});

				// Build a network instance based on the channel where the smart contract is deployed
				const network = await gateway.getNetwork(channelName);

				// Get the contract from the network.
				const contract = network.getContract(chaincodeName);

				// Call your CreateAsset function here with the provided parameters
				// Example:
				// await contract.submitTransaction('CreateAsset', id, color, size, owner, appraisedValue);
				result = await contract.submitTransaction('CreatePatient', username, password, patientID, firstName, lastName, dateOfBirth, gender, contactInfo, createdBy, timestamp);
				// Parse the result, which includes patient data and the transaction ID
				const { patient, transactionID } = JSON.parse(result.toString());

				console.log(`*** Result: committed with Transaction ID: ${transactionID}`);
				console.log(`*** Result: ${prettyJSONString(JSON.stringify(patient))}`);
				res.status(200).json({ message: 'Patient created successfully', patient, transactionID });
				} catch (error) {
				console.error(`Failed to create patient: ${error}`);
				res.status(500).json({ error: 'Failed to create patient' });
				}
			});

			/* Create Patient in MySQL*/
			const mysql = require('mysql');

			// MySQL database connection
			const db = mysql.createConnection({
			host: 'localhost',
			user: 'root',
			database: 'ehr',
			});

			db.connect((err) => {
			if (err) {
				console.error('Error connecting to MySQL database:', err);
			} else {
				console.log('Connected to MySQL database');
			}
			});

			app.use(express.json());
			// Create Patient API endpoint
			app.post('/api/create-patient-mysql', async (req, res) => {
				const { username, password, patientID, firstName, lastName, dateOfBirth, gender, contactInfo, createdBy, timestamp } = req.body;

				// Check if patientID already exists
				const checkPatientIDQuery = 'SELECT * FROM patients WHERE PatientID = ?';
				db.query(checkPatientIDQuery, [patientID], (error, patientIDResults) => {
					if (error) {
						console.error('Error checking patientID existence:', error);
						return res.status(500).json({ error: 'Failed to create patient' });
					}

					if (patientIDResults.length > 0) {
						return res.status(409).json({ error: `Patient with ID ${patientID} already exists` });
					}

					// Check if username already exists
					const checkUsernameQuery = 'SELECT * FROM accounts WHERE Username = ?';
					db.query(checkUsernameQuery, [username], (error, usernameResults) => {
						if (error) {
							console.error('Error checking username existence:', error);
							return res.status(500).json({ error: 'Failed to create patient' });
						}

						if (usernameResults.length > 0) {
							return res.status(409).json({ error: `Username ${username} already exists` });
						}

						// Insert data into patients table
						const insertPatientQuery = `
							INSERT INTO patients (PatientID, FirstName, LastName, DateOfBirth, Gender, ContactInfo) 
							VALUES (?, ?, ?, ?, ?, ?)
						`;

						// Insert data into accounts table
						const insertAccountQuery = `
							INSERT INTO accounts (Username, Password, UserType, UserID) 
							VALUES (?, ?, ?, ?)
						`;

						db.query(insertPatientQuery, [patientID, firstName, lastName, dateOfBirth, gender, contactInfo], (error, patientResults) => {
							if (error) {
								console.error('Failed to create patient:', error);
								return res.status(500).json({ error: 'Failed to create patient' });
							}

							console.log('Patient created successfully');

							// Insert into logChanges table for insertPatientQuery
							const insertPatientLogQuery = `
								INSERT INTO logChanges (Timestamp, Username, UserType, UserID, ChangeType)
								VALUES (?, ?, ?, ?, ?)
							`;

							db.query(insertPatientLogQuery, [timestamp, createdBy, 'patient', patientID, 'create'], (logError) => {
								if (logError) {
									console.error('Failed to insert into logChanges table:', logError);
									return res.status(500).json({ error: 'Failed to create patient log' });
								}

								console.log('Log entry added successfully for create-patient');

								// Insert data into accounts table
								db.query(insertAccountQuery, [username, password, 'patient', patientID], (accountError) => {
									if (accountError) {
										console.error('Failed to create account:', accountError);
										return res.status(500).json({ error: 'Failed to create account' });
									}

									console.log('Account created successfully');

									// Insert into logChanges table for insertAccountQuery
									const insertAccountLogQuery = `
										INSERT INTO logChanges (Timestamp, Username, UserType, UserID, ChangeType)
										VALUES (?, ?, ?, ?, ?)
									`;

									db.query(insertAccountLogQuery, [timestamp, createdBy, 'account', patientID, 'create'], (logError) => {
										if (logError) {
											console.error('Failed to insert into logChanges table:', logError);
											return res.status(500).json({ error: 'Failed to create account log' });
										}

										console.log('Log entry added successfully for create-account');
										return res.status(200).json({ message: 'Patient and account created successfully' });
									});
								});
							});
						});
					});
				});
			});
            
			/* Create Doctor */
			app.use(express.json());
			app.post('/api/create-doctor-fabric', async (req, res) => {
				const { username, password, doctorID, firstName, lastName, specialization, contactInfo, hospitalID, createdBy, timestamp } = req.body;
				try {
                // build an in memory object with the network configuration (also known as a connection profile)
				const ccp = buildCCPhospital();

				// build an instance of the fabric ca services client based on
				// the information in the network configuration
				const caClient = buildCAClient(FabricCAServices, ccp, 'ca.hospital.example.com');

				// setup the wallet to hold the credentials of the application user
				const wallet = await buildWallet(Wallets, walletPath);

				const gateway = new Gateway();
				await gateway.connect(ccp, {
					wallet,
					identity: hospitalUserId,
					discovery: { enabled: true, asLocalhost: true } // using asLocalhost as this gateway is using a fabric network deployed locally
				});

				// Build a network instance based on the channel where the smart contract is deployed
				const network = await gateway.getNetwork(channelName);

				// Get the contract from the network.
				const contract = network.getContract(chaincodeName);

				// Call your CreateAsset function here with the provided parameters
				// Example:
				// await contract.submitTransaction('CreateAsset', id, color, size, owner, appraisedValue);
				result = await contract.submitTransaction('CreateDoctor', username, password, doctorID, firstName, lastName, specialization, contactInfo, hospitalID, createdBy, timestamp);
				// Parse the result, which includes doctor data and the transaction ID
				const { doctor, transactionID } = JSON.parse(result.toString());

				console.log(`*** Result: committed with Transaction ID: ${transactionID}`);
				console.log(`*** Result: ${prettyJSONString(JSON.stringify(doctor))}`);
				res.status(200).json({ message: 'Doctor created successfully', doctor, transactionID });
				} catch (error) {
				console.error(`Failed to create doctor: ${error}`);
				res.status(500).json({ error: 'Failed to create doctor' });
				}
			});

			// Create Doctor API endpoint
			app.post('/api/create-doctor-mysql', async (req, res) => {
				const { username, password, doctorID, firstName, lastName, specialization, contactInfo, hospitalID, createdBy, timestamp } = req.body;

				// Check if doctorID already exists
				const checkDoctorIDQuery = 'SELECT * FROM doctors WHERE DoctorID = ?';
				db.query(checkDoctorIDQuery, [doctorID], (error, doctorIDResults) => {
					if (error) {
						console.error('Error checking doctorID existence:', error);
						return res.status(500).json({ error: 'Failed to create doctor' });
					}

					if (doctorIDResults.length > 0) {
						return res.status(409).json({ error: `Doctor with ID ${doctorID} already exists` });
					}

					// Check if username already exists
					const checkUsernameQuery = 'SELECT * FROM accounts WHERE Username = ?';
					db.query(checkUsernameQuery, [username], (error, usernameResults) => {
						if (error) {
							console.error('Error checking username existence:', error);
							return res.status(500).json({ error: 'Failed to create doctor' });
						}

						if (usernameResults.length > 0) {
							return res.status(409).json({ error: `Username ${username} already exists` });
						}

						// Check if hospitalID exists
						const checkHospitalQuery = 'SELECT * FROM hospitals WHERE HospitalID = ?';
						db.query(checkHospitalQuery, [hospitalID], (error, hospitalResults) => {
							if (error) {
								console.error('Error checking hospital existence:', error);
								return res.status(500).json({ error: 'Failed to create doctor' });
							}

							if (hospitalResults.length === 0) {
								return res.status(404).json({ error: `Hospital with ID ${hospitalID} does not exist` });
							}

							// HospitalID exists, proceed with insertDoctorQuery
							const insertDoctorQuery = `
								INSERT INTO doctors (DoctorID, FirstName, LastName, Specialization, ContactInfo, HospitalID) 
								VALUES (?, ?, ?, ?, ?, ?)
							`;

							const insertAccountQuery = `
								INSERT INTO accounts (Username, Password, UserType, UserID) 
								VALUES (?, ?, ?, ?)
							`;

							db.query(insertDoctorQuery, [doctorID, firstName, lastName, specialization, contactInfo, hospitalID], (error, doctorResults) => {
								if (error) {
									console.error('Failed to create doctor:', error);
									return res.status(500).json({ error: 'Failed to create doctor' });
								}

								console.log('Doctor created successfully');

								// Insert into logChanges table for insertDoctorQuery
								const insertDoctorLogQuery = `
									INSERT INTO logChanges (Timestamp, Username, UserType, UserID, ChangeType)
									VALUES (?, ?, ?, ?, ?)
								`;

								db.query(insertDoctorLogQuery, [timestamp, createdBy, 'doctor', doctorID, 'create'], (logError) => {
									if (logError) {
										console.error('Failed to insert into logChanges table:', logError);
										return res.status(500).json({ error: 'Failed to create doctor log' });
									}

									console.log('Log entry added successfully for create-doctor');

									// Insert data into accounts table
									db.query(insertAccountQuery, [username, password, 'doctor', doctorID], (accountError) => {
										if (accountError) {
											console.error('Failed to create account:', accountError);
											return res.status(500).json({ error: 'Failed to create account' });
										}

										console.log('Account created successfully');

										// Insert into logChanges table for insertAccountQuery
										const insertAccountLogQuery = `
											INSERT INTO logChanges (Timestamp, Username, UserType, UserID, ChangeType)
											VALUES (?, ?, ?, ?, ?)
										`;

										db.query(insertAccountLogQuery, [timestamp, createdBy, 'account', doctorID, 'create'], (logError) => {
											if (logError) {
												console.error('Failed to insert into logChanges table:', logError);
												return res.status(500).json({ error: 'Failed to create account log' });
											}

											console.log('Log entry added successfully for create-account');
											return res.status(200).json({ message: 'Doctor and account created successfully' });
										});
									});
								});
							});
						});
					});
				});
			});

			/* Create Medical Record */
            // ... (previous code)
			app.use(express.json());
			app.post('/api/create-record-fabric', async (req, res) => {
				const { recordID, patientID, doctorID, hospitalID, date, diagnosis, treatment, medications, notes, createdBy, timestamp } = req.body;
				try {
                // build an in memory object with the network configuration (also known as a connection profile)
				const ccp = buildCCPhospital();

				// build an instance of the fabric ca services client based on
				// the information in the network configuration
				const caClient = buildCAClient(FabricCAServices, ccp, 'ca.hospital.example.com');

				// setup the wallet to hold the credentials of the application user
				const wallet = await buildWallet(Wallets, walletPath);

				const gateway = new Gateway();
				await gateway.connect(ccp, {
					wallet,
					identity: hospitalUserId,
					discovery: { enabled: true, asLocalhost: true } // using asLocalhost as this gateway is using a fabric network deployed locally
				});

				// Build a network instance based on the channel where the smart contract is deployed
				const network = await gateway.getNetwork(channelName);

				// Get the contract from the network.
				const contract = network.getContract(chaincodeName);

				// Call your CreateAsset function here with the provided parameters
				// Example:
				// await contract.submitTransaction('CreateAsset', id, color, size, owner, appraisedValue);
				result = await contract.submitTransaction('CreateMedicalRecord', recordID, patientID, doctorID, hospitalID, date, diagnosis, treatment, medications, notes, createdBy, timestamp);
				// Parse the result, which includes hospital data and the transaction ID
				const { medicalRecord, transactionID } = JSON.parse(result.toString());

				console.log(`*** Result: committed with Transaction ID: ${transactionID}`);
				console.log(`*** Result: ${prettyJSONString(JSON.stringify(medicalRecord))}`);
				res.status(200).json({ message: 'Medical Record created successfully', medicalRecord, transactionID });
				} catch (error) {
				console.error(`Failed to create Medical Record: ${error}`);
				res.status(500).json({ error: 'Failed to create Medical Record' });
				}
			});

			// Create Medical Record in MySQL
			app.post('/api/create-record-mysql', async (req, res) => {
				const { recordID, patientID, doctorID, hospitalID, date, diagnosis, treatment, medications, notes, createdBy, timestamp } = req.body;

				// Check if recordID already exists
				const checkRecordQuery = 'SELECT * FROM medical_records WHERE RecordID = ?';
				db.query(checkRecordQuery, [recordID], (error, recordResults) => {
					if (error) {
						console.error('Error checking record existence:', error);
						res.status(500).json({ error: 'Failed to create medical record' });
						return;
					}

					if (recordResults.length > 0) {
						res.status(409).json({ error: `Medical record with ID ${recordID} already exists` });
						return;
					}

					// Check if patientID exists
					const checkPatientQuery = 'SELECT * FROM patients WHERE PatientID = ?';
					db.query(checkPatientQuery, [patientID], (error, patientResults) => {
						if (error) {
							console.error('Error checking patient existence:', error);
							res.status(500).json({ error: 'Failed to create medical record' });
							return;
						}

						if (patientResults.length === 0) {
							res.status(404).json({ error: `Patient with ID ${patientID} does not exist` });
							return;
						}

						// Check if doctorID exists
						const checkDoctorQuery = 'SELECT * FROM doctors WHERE DoctorID = ?';
						db.query(checkDoctorQuery, [doctorID], (error, doctorResults) => {
							if (error) {
								console.error('Error checking doctor existence:', error);
								res.status(500).json({ error: 'Failed to create medical record' });
								return;
							}

							if (doctorResults.length === 0) {
								res.status(404).json({ error: `Doctor with ID ${doctorID} does not exist` });
								return;
							}

							// Check if hospitalID exists
							const checkHospitalQuery = 'SELECT * FROM hospitals WHERE HospitalID = ?';
							db.query(checkHospitalQuery, [hospitalID], (error, hospitalResults) => {
								if (error) {
									console.error('Error checking hospital existence:', error);
									res.status(500).json({ error: 'Failed to create medical record' });
									return;
								}

								if (hospitalResults.length === 0) {
									res.status(404).json({ error: `Hospital with ID ${hospitalID} does not exist` });
									return;
								}

								// All IDs exist, proceed with the insertRecordQuery
								const insertRecordQuery = `
									INSERT INTO medical_records (RecordID, PatientID, DoctorID, HospitalID, Date, Diagnosis, Treatment, Medications, Notes) 
									VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
								`;

								db.query(
									insertRecordQuery,
									[recordID, patientID, doctorID, hospitalID, date, diagnosis, treatment, medications, notes],
									(error, results) => {
										if (error) {
											console.error('Failed to create medical record:', error);
											res.status(500).json({ error: 'Failed to create medical record' });
										} else {
											console.log('Medical record created successfully');

											// Insert into logChanges table for insertRecordQuery
											const insertRecordLogQuery = `
												INSERT INTO logChanges (Timestamp, Username, UserType, UserID, ChangeType)
												VALUES (?, ?, ?, ?, ?)
											`;

											db.query(insertRecordLogQuery, [timestamp, createdBy, 'medicalRecord', recordID, 'create'], (logError) => {
												if (logError) {
													console.error('Failed to insert into logChanges table:', logError);
													res.status(500).json({ error: 'Failed to create record log' });
												} else {
													console.log('Log entry added successfully for create-record');
													// Only one response here
													res.status(200).json({ message: 'Medical record created successfully' });
												}
											});
										}
									}
								);
							});
						});
					});
				});
			});
			
			/* Create Hospital */
			app.use(express.json());
			app.post('/api/create-hospital-fabric', async (req, res) => {
				const { username, password, hospitalID, hospitalName, location, contactInfo, createdBy, timestamp } = req.body;
				try {
				// build an in memory object with the network configuration (also known as a connection profile)
				const ccp = buildCCPhospital();

				// build an instance of the fabric ca services client based on
				// the information in the network configuration
				const caClient = buildCAClient(FabricCAServices, ccp, 'ca.hospital.example.com');

				// setup the wallet to hold the credentials of the application user
				const wallet = await buildWallet(Wallets, walletPath);

				const gateway = new Gateway();
				await gateway.connect(ccp, {
					wallet,
					identity: hospitalUserId,
					discovery: { enabled: true, asLocalhost: true } // using asLocalhost as this gateway is using a fabric network deployed locally
				});

				// Build a network instance based on the channel where the smart contract is deployed
				const network = await gateway.getNetwork(channelName);

				// Get the contract from the network.
				const contract = network.getContract(chaincodeName);

				// Call your CreateAsset function here with the provided parameters
				// Example:
				// await contract.submitTransaction('CreateAsset', id, color, size, owner, appraisedValue);
				result = await contract.submitTransaction('CreateHospital', username, password, hospitalID, hospitalName, location, contactInfo, createdBy, timestamp);
				// Parse the result, which includes medical record data and the transaction ID
				const { medicalRecord, transactionID } = JSON.parse(result.toString());

				console.log(`*** Result: committed with Transaction ID: ${transactionID}`);
				console.log(`*** Result: ${prettyJSONString(JSON.stringify(medicalRecord))}`);
				res.status(200).json({ message: 'Medical Record created successfully', medicalRecord, transactionID });
				} catch (error) {
				console.error(`Failed to create patient: ${error}`);
				res.status(500).json({ error: 'Failed to create Hospital' });
				}
			});

			/* Create Hospital in MySQL*/
			app.post('/api/create-hospital-mysql', async (req, res) => {
				const { username, password, hospitalID, hospitalName, location, contactInfo, createdBy, timestamp } = req.body;

				// Check if username already exists
				const checkUsernameQuery = 'SELECT * FROM accounts WHERE Username = ?';
				db.query(checkUsernameQuery, [username], (usernameError, usernameResults) => {
					if (usernameError) {
						console.error('Error checking username existence:', usernameError);
						return res.status(500).json({ error: 'Failed to create hospital' });
					}

					if (usernameResults.length > 0) {
						return res.status(409).json({ error: `Username ${username} already exists` });
					}

					// Check if hospitalID already exists
					const checkHospitalIDQuery = 'SELECT * FROM hospitals WHERE HospitalID = ?';
					db.query(checkHospitalIDQuery, [hospitalID], (hospitalError, hospitalResults) => {
						if (hospitalError) {
							console.error('Error checking hospitalID existence:', hospitalError);
							return res.status(500).json({ error: 'Failed to create hospital' });
						}

						if (hospitalResults.length > 0) {
							return res.status(409).json({ error: `Hospital with ID ${hospitalID} already exists` });
						}

						// Insert data into MySQL database
						const insertHospitalQuery = `
							INSERT INTO hospitals (HospitalID, HospitalName, Location, ContactInfo) 
							VALUES (?, ?, ?, ?)
						`;

						const insertAccountQuery = `
							INSERT INTO accounts (Username, Password, UserType, UserID) 
							VALUES (?, ?, ?, ?)
						`;

						db.query(insertHospitalQuery, [hospitalID, hospitalName, location, contactInfo], (hospitalError, hospitalResults) => {
							if (hospitalError) {
								console.error('Failed to create hospital:', hospitalError);
								res.status(500).json({ error: 'Failed to create hospital' });
							} else {
								console.log('Hospital created successfully');

								// Insert into logChanges table for insertHospitalQuery
								const inserthospitalLogQuery = `
									INSERT INTO logChanges (Timestamp, Username, UserType, UserID, ChangeType)
									VALUES (?, ?, ?, ?, ?)
								`;

								db.query(inserthospitalLogQuery, [timestamp, createdBy, 'hospital', hospitalID, 'create'], (logError) => {
									if (logError) {
										console.error('Failed to insert into logChanges table:', logError);
										res.status(500).json({ error: 'Failed to create hospital log' });
									} else {
										console.log('Log entry added successfully for create-hospital');

										// Insert data into accounts table
										db.query(insertAccountQuery, [username, password, 'hospital', hospitalID, 'create'], (accountError) => {
											if (accountError) {
												console.error('Failed to create account:', accountError);
												res.status(500).json({ error: 'Failed to create account' });
											} else {
												console.log('Account created successfully');
												res.status(200).json({ message: 'Hospital and account created successfully' });
											}
										});
									}
								});
							}
						});
					});
				});
			});	

			console.log('\n--> Evaluate Transaction: ReadPatient, function returns an asset with a given patientID');
			result = await contract.evaluateTransaction('ReadPatient', 'P001');
			console.log(`*** Result: ${prettyJSONString(result.toString())}`);

			/*--- Server ---*/
			/*--- Read Patient ---*/
			// Route for reading an asset
			app.get('/api/read-patient/:id', async (req, res) => {
				const assetId = req.params.id;
			
				try {
                // build an in memory object with the network configuration (also known as a connection profile)
				const ccp = buildCCPhospital();

				// build an instance of the fabric ca services client based on
				// the information in the network configuration
				const caClient = buildCAClient(FabricCAServices, ccp, 'ca.hospital.example.com');

				// setup the wallet to hold the credentials of the application user
				const wallet = await buildWallet(Wallets, walletPath);

				const gateway = new Gateway();
				await gateway.connect(ccp, {
					wallet,
					identity: hospitalUserId,
					discovery: { enabled: true, asLocalhost: true } // using asLocalhost as this gateway is using a fabric network deployed locally
				});

				// Build a network instance based on the channel where the smart contract is deployed
				const network = await gateway.getNetwork(channelName);

				// Get the contract from the network.
				const contract = network.getContract(chaincodeName);

				// Call the smart contract function to read an asset by ID
				const result = await contract.evaluateTransaction('ReadPatient', assetId);
				const asset = JSON.parse(result.toString());
			
				// Send the asset data as JSON response
				res.status(200).json(asset);
				} catch (error) {
				// Handle errors if the asset does not exist
				if (error.message.includes('does not exist')) {
					res.status(404).json({ error: `The asset ${assetId} does not exist` });
				} else {
					console.error(`Failed to read asset: ${error}`);
					res.status(500).json({ error: 'Failed to read asset' });
				}
				}
			});  

			/*--- Read Doctor ---*/
			// Route for reading an asset
			app.get('/api/read-doctor/:id', async (req, res) => {
				const assetId = req.params.id;
			
				try {
                // build an in memory object with the network configuration (also known as a connection profile)
				const ccp = buildCCPhospital();

				// build an instance of the fabric ca services client based on
				// the information in the network configuration
				const caClient = buildCAClient(FabricCAServices, ccp, 'ca.hospital.example.com');

				// setup the wallet to hold the credentials of the application user
				const wallet = await buildWallet(Wallets, walletPath);

				const gateway = new Gateway();
				await gateway.connect(ccp, {
					wallet,
					identity: hospitalUserId,
					discovery: { enabled: true, asLocalhost: true } // using asLocalhost as this gateway is using a fabric network deployed locally
				});

				// Build a network instance based on the channel where the smart contract is deployed
				const network = await gateway.getNetwork(channelName);

				// Get the contract from the network.
				const contract = network.getContract(chaincodeName);

				// Call the smart contract function to read an asset by ID
				const result = await contract.evaluateTransaction('ReadDoctor', assetId);
				const asset = JSON.parse(result.toString());
			
				// Send the asset data as JSON response
				res.status(200).json(asset);
				} catch (error) {
				// Handle errors if the asset does not exist
				if (error.message.includes('does not exist')) {
					res.status(404).json({ error: `The asset ${assetId} does not exist` });
				} else {
					console.error(`Failed to read asset: ${error}`);
					res.status(500).json({ error: 'Failed to read asset' });
				}
				}
			});  

			/*--- Read Medical Record ---*/
			// Route for reading an asset
			app.get('/api/read-record/:id', async (req, res) => {
				const assetId = req.params.id;
			
				try {
                // build an in memory object with the network configuration (also known as a connection profile)
				const ccp = buildCCPhospital();

				// build an instance of the fabric ca services client based on
				// the information in the network configuration
				const caClient = buildCAClient(FabricCAServices, ccp, 'ca.hospital.example.com');

				// setup the wallet to hold the credentials of the application user
				const wallet = await buildWallet(Wallets, walletPath);

				const gateway = new Gateway();
				await gateway.connect(ccp, {
					wallet,
					identity: hospitalUserId,
					discovery: { enabled: true, asLocalhost: true } // using asLocalhost as this gateway is using a fabric network deployed locally
				});

				// Build a network instance based on the channel where the smart contract is deployed
				const network = await gateway.getNetwork(channelName);

				// Get the contract from the network.
				const contract = network.getContract(chaincodeName);

				// Call the smart contract function to read an asset by ID
				const result = await contract.evaluateTransaction('ReadMedicalRecord', assetId);
				const asset = JSON.parse(result.toString());
			
				// Send the asset data as JSON response
				res.status(200).json(asset);
				} catch (error) {
				// Handle errors if the asset does not exist
				if (error.message.includes('does not exist')) {
					res.status(404).json({ error: `The asset ${assetId} does not exist` });
				} else {
					console.error(`Failed to read asset: ${error}`);
					res.status(500).json({ error: 'Failed to read asset' });
				}
				}
			});  

			/*--- Read Medical Records By Patient Id ---*/
			// Route for reading an asset
			app.get('/api/read-records/:id', async (req, res) => {
				const assetId = req.params.id;
			
				try {
                // build an in memory object with the network configuration (also known as a connection profile)
				const ccp = buildCCPhospital();

				// build an instance of the fabric ca services client based on
				// the information in the network configuration
				const caClient = buildCAClient(FabricCAServices, ccp, 'ca.hospital.example.com');

				// setup the wallet to hold the credentials of the application user
				const wallet = await buildWallet(Wallets, walletPath);

				const gateway = new Gateway();
				await gateway.connect(ccp, {
					wallet,
					identity: hospitalUserId,
					discovery: { enabled: true, asLocalhost: true } // using asLocalhost as this gateway is using a fabric network deployed locally
				});

				// Build a network instance based on the channel where the smart contract is deployed
				const network = await gateway.getNetwork(channelName);

				// Get the contract from the network.
				const contract = network.getContract(chaincodeName);

				// Call the smart contract function to read an asset by ID
				const result = await contract.evaluateTransaction('GetMedicalRecordsByPatientID', assetId);
				const asset = JSON.parse(result.toString());
			
				// Send the asset data as JSON response
				res.status(200).json(asset);
				} catch (error) {
				// Handle errors if the asset does not exist
				if (error.message.includes('does not exist')) {
					res.status(404).json({ error: `The asset ${assetId} does not exist` });
				} else {
					console.error(`Failed to read asset: ${error}`);
					res.status(500).json({ error: 'Failed to read asset' });
				}
				}
			});  

			/*--- Read Hospital ---*/
			// Route for reading an asset
			app.get('/api/read-hospital/:id', async (req, res) => {
				const assetId = req.params.id;
			
				try {
                // build an in memory object with the network configuration (also known as a connection profile)
				const ccp = buildCCPhospital();

				// build an instance of the fabric ca services client based on
				// the information in the network configuration
				const caClient = buildCAClient(FabricCAServices, ccp, 'ca.hospital.example.com');

				// setup the wallet to hold the credentials of the application user
				const wallet = await buildWallet(Wallets, walletPath);

				const gateway = new Gateway();
				await gateway.connect(ccp, {
					wallet,
					identity: hospitalUserId,
					discovery: { enabled: true, asLocalhost: true } // using asLocalhost as this gateway is using a fabric network deployed locally
				});

				// Build a network instance based on the channel where the smart contract is deployed
				const network = await gateway.getNetwork(channelName);

				// Get the contract from the network.
				const contract = network.getContract(chaincodeName);

				// Call the smart contract function to read an asset by ID
				const result = await contract.evaluateTransaction('ReadHospital', assetId);
				const asset = JSON.parse(result.toString());
			
				// Send the asset data as JSON response
				res.status(200).json(asset);
				} catch (error) {
				// Handle errors if the asset does not exist
				if (error.message.includes('does not exist')) {
					res.status(404).json({ error: `The Hospital ${assetId} does not exist` });
				} else {
					console.error(`Failed to read Hospital: ${error}`);
					res.status(500).json({ error: 'Failed to read Hospital' });
				}
				}
			});  

			console.log('\n--> Evaluate Transaction: AssetExists, function returns "true" if an asset with given assetID exist');
			result = await contract.evaluateTransaction('PatientExists', 'patient1');
			console.log(`*** Result: ${prettyJSONString(result.toString())}`);
            
			/*
			console.log('\n--> Submit Transaction: UpdateAsset asset1, change the appraisedValue to 350');
			await contract.submitTransaction('UpdateAsset', 'asset1', 'blue', '5', 'Tomoko', '350');
			console.log('*** Result: committed');
            */

			/*--- Server ---*/
            /*--- Update Patient ---*/
			app.use(express.json());

			// Route for updating an asset
			app.put('/api/update-patient-fabric', async (req, res) => {
			const { patientID, firstName, lastName, dateOfBirth, gender, contactInfo, username, timestamp } = req.body;
			
			try {
                // build an in memory object with the network configuration (also known as a connection profile)
				const ccp = buildCCPhospital();

				// build an instance of the fabric ca services client based on
				// the information in the network configuration
				const caClient = buildCAClient(FabricCAServices, ccp, 'ca.hospital.example.com');

				// setup the wallet to hold the credentials of the application user
				const wallet = await buildWallet(Wallets, walletPath);

				const gateway = new Gateway();
				await gateway.connect(ccp, {
					wallet,
					identity: hospitalUserId,
					discovery: { enabled: true, asLocalhost: true } // using asLocalhost as this gateway is using a fabric network deployed locally
				});

				// Build a network instance based on the channel where the smart contract is deployed
				const network = await gateway.getNetwork(channelName);

				// Get the contract from the network.
				const contract = network.getContract(chaincodeName);

				// Check if the asset with the given ID exists
				const exists = await contract.evaluateTransaction('PatientExists', patientID);
				if (!exists || exists.toString() === 'false') {
				res.status(404).json({ error: `The asset ${patientID} does not exist` });
				return;
				}

				// Update the asset with the provided data
				await contract.submitTransaction('UpdatePatient', patientID, firstName, lastName, dateOfBirth, gender, contactInfo, username, timestamp);

				// Send a success response
				res.status(200).json({ message: 'Patient updated successfully' });
			} catch (error) {
				console.error(`Failed to update patient: ${error}`);
				res.status(500).json({ error: 'Failed to update patient' });
			}
			});

			/*--- Update Patient in MySQL ---*/
			app.use(express.json());

			// Route for updating a patient
			app.put('/api/update-patient-mysql', async (req, res) => {
			const { patientID, firstName, lastName, dateOfBirth, gender, contactInfo, username, timestamp } = req.body;

			try {
				// Update patient information in MySQL database
				const updatePatientQuery = `
				UPDATE patients
				SET FirstName = ?, LastName = ?, DateOfBirth = ?, Gender = ?, ContactInfo = ?
				WHERE PatientID = ?;
				`;

				db.query(
				updatePatientQuery,
				[firstName, lastName, dateOfBirth, gender, contactInfo, patientID],
				async (error, patientResults) => {
					if (error) {
					console.error('Failed to update patient:', error);
					res.status(500).json({ error: 'Failed to update patient' });
					} else {
					console.log('Patient updated successfully');

					// Insert into logChanges table
					const insertLogQuery = `
						INSERT INTO logChanges (Timestamp, Username, UserType, UserID, ChangeType)
						VALUES (?, ?, ?, ?, ?);
					`;

					db.query(insertLogQuery, [timestamp, username, 'patient', patientID, 'update'], (logError) => {
						if (logError) {
						console.error('Failed to insert into logChanges table:', logError);
						res.status(500).json({ error: 'Failed to update patient log' });
						} else {
						console.log('Log entry added successfully');
						res.status(200).json({ message: 'Patient updated successfully' });
						}
					});
					}
				}
				);
			} catch (error) {
				console.error(`Failed to update patient: ${error}`);
				res.status(500).json({ error: 'Failed to update patient' });
			}
			});

            /*--- Update Doctor ---*/
			app.use(express.json());

			// Route for updating an asset
			app.put('/api/update-doctor-fabric', async (req, res) => {
			const { doctorID, firstName, lastName, specialization, contactInfo, hospitalID, username, timestamp } = req.body;
			
			try {
                // build an in memory object with the network configuration (also known as a connection profile)
				const ccp = buildCCPhospital();

				// build an instance of the fabric ca services client based on
				// the information in the network configuration
				const caClient = buildCAClient(FabricCAServices, ccp, 'ca.hospital.example.com');

				// setup the wallet to hold the credentials of the application user
				const wallet = await buildWallet(Wallets, walletPath);

				const gateway = new Gateway();
				await gateway.connect(ccp, {
					wallet,
					identity: hospitalUserId,
					discovery: { enabled: true, asLocalhost: true } // using asLocalhost as this gateway is using a fabric network deployed locally
				});

				// Build a network instance based on the channel where the smart contract is deployed
				const network = await gateway.getNetwork(channelName);

				// Get the contract from the network.
				const contract = network.getContract(chaincodeName);

				// Check if the asset with the given ID exists
				const exists = await contract.evaluateTransaction('DoctorExists', doctorID);
				if (!exists || exists.toString() === 'false') {
				res.status(404).json({ error: `The asset ${doctorID} does not exist` });
				return;
				}

				// Update the asset with the provided data
				await contract.submitTransaction('UpdateDoctor', doctorID, firstName, lastName, specialization, contactInfo, hospitalID, username, timestamp);

				// Send a success response
				res.status(200).json({ message: 'Doctor updated successfully' });
			} catch (error) {
				console.error(`Failed to update doctor: ${error}`);
				res.status(500).json({ error: 'Failed to update doctor' });
			}
			});

			/*--- Update Doctor in MySQL ---*/
			app.use(express.json());

			// Route for updating a patient
			app.put('/api/update-doctor-mysql', async (req, res) => {
			const { doctorID, firstName, lastName, specialization, contactInfo, hospitalID, username, timestamp } = req.body;

			try {
				// Update patient information in MySQL database
				const updateDoctorQuery = `
				UPDATE doctors
				SET FirstName = ?, LastName = ?, Specialization = ?, ContactInfo = ?, HospitalID = ?
				WHERE DoctorID = ?;
				`;

				db.query(
				updateDoctorQuery,
				[firstName, lastName, specialization, contactInfo, hospitalID, doctorID],
				async (error, doctorResults) => {
					if (error) {
					console.error('Failed to update doctor:', error);
					res.status(500).json({ error: 'Failed to update doctor' });
					} else {
					console.log('Doctor updated successfully');

					// Insert into logChanges table
					const insertLogQuery = `
						INSERT INTO logChanges (Timestamp, Username, UserType, UserID, ChangeType)
						VALUES (?, ?, ?, ?, ?);
					`;

					db.query(insertLogQuery, [timestamp, username, 'doctor', doctorID, 'update'], (logError) => {
						if (logError) {
						console.error('Failed to insert into logChanges table:', logError);
						res.status(500).json({ error: 'Failed to update doctor log' });
						} else {
						console.log('Log entry added successfully');
						res.status(200).json({ message: 'Doctor updated successfully' });
						}
					});
					}
				}
				);
			} catch (error) {
				console.error(`Failed to update doctor: ${error}`);
				res.status(500).json({ error: 'Failed to update doctor' });
			}
			});

			/*--- Update Medical Record ---*/
			app.use(express.json());

			// Route for updating an asset
			app.put('/api/update-record-fabric', async (req, res) => {
			const { recordID, patientID, doctorID, hospitalID, date, diagnosis, treatment, medications, notes, username, timestamp } = req.body;
			
			try {
				// build an in memory object with the network configuration (also known as a connection profile)
				const ccp = buildCCPhospital();

				// build an instance of the fabric ca services client based on
				// the information in the network configuration
				const caClient = buildCAClient(FabricCAServices, ccp, 'ca.hospital.example.com');

				// setup the wallet to hold the credentials of the application user
				const wallet = await buildWallet(Wallets, walletPath);

				const gateway = new Gateway();
				await gateway.connect(ccp, {
					wallet,
					identity: hospitalUserId,
					discovery: { enabled: true, asLocalhost: true } // using asLocalhost as this gateway is using a fabric network deployed locally
				});

				// Build a network instance based on the channel where the smart contract is deployed
				const network = await gateway.getNetwork(channelName);

				// Get the contract from the network.
				const contract = network.getContract(chaincodeName);

				// Check if the asset with the given ID exists
				const exists = await contract.evaluateTransaction('MedicalRecordExists', recordID);
				if (!exists || exists.toString() === 'false') {
				res.status(404).json({ error: `The asset ${patientID} does not exist` });
				return;
				}

				// Update the asset with the provided data
				await contract.submitTransaction('UpdateMedicalRecord', recordID, patientID, doctorID, hospitalID, date, diagnosis, treatment, medications, notes, username, timestamp );

				// Send a success response
				res.status(200).json({ message: 'Medical Record updated successfully' });
			} catch (error) {
				console.error(`Failed to update Medical Record: ${error}`);
				res.status(500).json({ error: 'Failed to update Medical Record' });
			}
			});

			/*--- Update Medical Record in MySQL ---*/
			app.use(express.json());

			// Route for updating a Medical Record
			app.put('/api/update-record-mysql', async (req, res) => {
			const { recordID, patientID, doctorID, hospitalID, date, diagnosis, treatment, medications, notes, username, timestamp } = req.body;

			try {
				// Update patient information in MySQL database
				const updateRecordQuery = `
				UPDATE medical_records
				SET PatientID = ?, DoctorID = ?, HospitalID = ?, Date = ?, Diagnosis = ?, Treatment = ?, Medications = ?, Notes = ?
				WHERE RecordID = ?;
				`;

				db.query(
				updateRecordQuery,
				[patientID, doctorID, hospitalID, date, diagnosis, treatment, medications, notes, recordID],
				async (error, recordResults) => {
					if (error) {
					console.error('Failed to update medical record:', error);
					res.status(500).json({ error: 'Failed to update medical record' });
					} else {
					console.log('Medical Record updated successfully');

					// Insert into logChanges table
					const insertLogQuery = `
						INSERT INTO logChanges (Timestamp, Username, UserType, UserID, ChangeType)
						VALUES (?, ?, ?, ?, ?);
					`;

					db.query(insertLogQuery, [timestamp, username, 'medicalRecord', recordID, 'update'], (logError) => {
						if (logError) {
						console.error('Failed to insert into logChanges table:', logError);
						res.status(500).json({ error: 'Failed to update medical record log' });
						} else {
						console.log('Log entry added successfully');
						res.status(200).json({ message: 'Medical Record updated successfully' });
						}
					});
					}
				}
				);
			} catch (error) {
				console.error(`Failed to update medical record: ${error}`);
				res.status(500).json({ error: 'Failed to update medical record' });
			}
			});
						
			// Update Account
			app.put('/api/update-account-fabric', async (req, res) => {
				const { username, password, userType, userID, timestamp } = req.body;
				
				try {
					// build an in memory object with the network configuration (also known as a connection profile)
					const ccp = buildCCPhospital();
	
					// build an instance of the fabric ca services client based on
					// the information in the network configuration
					const caClient = buildCAClient(FabricCAServices, ccp, 'ca.hospital.example.com');
	
					// setup the wallet to hold the credentials of the application user
					const wallet = await buildWallet(Wallets, walletPath);
	
					const gateway = new Gateway();
					await gateway.connect(ccp, {
						wallet,
						identity: hospitalUserId,
						discovery: { enabled: true, asLocalhost: true } // using asLocalhost as this gateway is using a fabric network deployed locally
					});
	
					// Build a network instance based on the channel where the smart contract is deployed
					const network = await gateway.getNetwork(channelName);
	
					// Get the contract from the network.
					const contract = network.getContract(chaincodeName);
	
					// Check if the asset with the given ID exists
					const exists = await contract.evaluateTransaction('AccountExists', username);
					if (!exists || exists.toString() === 'false') {
					res.status(404).json({ error: `The asset ${username} does not exist` });
					return;
					}
	
					// Update the asset with the provided data
					await contract.submitTransaction('UpdateAccount', username, password, userType, userID, timestamp);
	
					// Send a success response
					res.status(200).json({ message: 'UpdateAccount updated successfully' });
				} catch (error) {
					console.error(`Failed to update account: ${error}`);
					res.status(500).json({ error: 'Failed to update account' });
				}
			});

			/*--- Update Account in MySQL ---*/
			app.use(express.json());

			// Route for updating a patient
			app.put('/api/update-account-mysql', async (req, res) => {
			const { username, password, userType, userID, timestamp } = req.body;

			try {
				// Update patient information in MySQL database
				const updateAccountQuery = `
				UPDATE accounts
				SET Username = ?, Password = ?, UserType = ?, UserID = ?
				WHERE Username = ?;
				`;

				db.query(
				updateAccountQuery,
				[username, password, userType, userID, username],
				async (error, accountResults) => {
					if (error) {
					console.error('Failed to update account:', error);
					res.status(500).json({ error: 'Failed to update account' });
					} else {
					console.log('Account updated successfully');

					// Insert into logChanges table
					const insertLogQuery = `
						INSERT INTO logChanges (Timestamp, Username, UserType, UserID, ChangeType)
						VALUES (?, ?, ?, ?, ?);
					`;

					db.query(insertLogQuery, [timestamp, username, 'account', userID, 'update'], (logError) => {
						if (logError) {
						console.error('Failed to insert into logChanges table:', logError);
						res.status(500).json({ error: 'Failed to update doctor log' });
						} else {
						console.log('Log entry added successfully');
						res.status(200).json({ message: 'Account updated successfully' });
						}
					});
					}
				}
				);
			} catch (error) {
				console.error(`Failed to update account: ${error}`);
				res.status(500).json({ error: 'Failed to update account' });
			}
			});

			/*--- Server ---*/
			/*--- Delete Patient ---*/
			app.delete('/api/delete-patient/:id', async (req, res) => {
				const { id } = req.params;
			  
				try {
                // build an in memory object with the network configuration (also known as a connection profile)
				const ccp = buildCCPhospital();

				// build an instance of the fabric ca services client based on
				// the information in the network configuration
				const caClient = buildCAClient(FabricCAServices, ccp, 'ca.hospital.example.com');

				// setup the wallet to hold the credentials of the application user
				const wallet = await buildWallet(Wallets, walletPath);

				const gateway = new Gateway();
				await gateway.connect(ccp, {
					wallet,
					identity: hospitalUserId,
					discovery: { enabled: true, asLocalhost: true } // using asLocalhost as this gateway is using a fabric network deployed locally
				});

				// Build a network instance based on the channel where the smart contract is deployed
				const network = await gateway.getNetwork(channelName);

				// Get the contract from the network.
				const contract = network.getContract(chaincodeName);
			  
				  // Call the DeleteAsset function to delete the asset with the given ID
				  await contract.submitTransaction('DeletePatient', id);
			  
				  console.log(`Asset ${id} deleted successfully`);
				  res.status(200).json({ message: `Patient ${id} deleted successfully` });
				} catch (error) {
				  console.error(`Failed to delete asset: ${error}`);
				  res.status(500).json({ error: `Failed to delete Patient: ${error.message}` });
				}
			});		


			/*--- Delete Doctor ---*/
			app.delete('/api/delete-doctor/:id', async (req, res) => {
				const { id } = req.params;
				
				try {
				// build an in memory object with the network configuration (also known as a connection profile)
				const ccp = buildCCPhospital();

				// build an instance of the fabric ca services client based on
				// the information in the network configuration
				const caClient = buildCAClient(FabricCAServices, ccp, 'ca.hospital.example.com');

				// setup the wallet to hold the credentials of the application user
				const wallet = await buildWallet(Wallets, walletPath);

				const gateway = new Gateway();
				await gateway.connect(ccp, {
					wallet,
					identity: hospitalUserId,
					discovery: { enabled: true, asLocalhost: true } // using asLocalhost as this gateway is using a fabric network deployed locally
				});

				// Build a network instance based on the channel where the smart contract is deployed
				const network = await gateway.getNetwork(channelName);

				// Get the contract from the network.
				const contract = network.getContract(chaincodeName);
				
					// Call the DeleteAsset function to delete the asset with the given ID
					await contract.submitTransaction('DeleteDoctor', id);
				
					console.log(`Asset ${id} deleted successfully`);
					res.status(200).json({ message: `Doctor ${id} deleted successfully` });
				} catch (error) {
					console.error(`Failed to delete asset: ${error}`);
					res.status(500).json({ error: `Failed to delete Doctor: ${error.message}` });
				}
			});			  

			/*--- 
			console.log('\n--> Evaluate Transaction: ReadAsset, function returns "asset1" attributes');
			result = await contract.evaluateTransaction('ReadAsset', 'asset1');
			console.log(`*** Result: ${prettyJSONString(result.toString())}`);

			try {
				// How about we try a transactions where the executing chaincode throws an error
				// Notice how the submitTransaction will throw an error containing the error thrown by the chaincode
				console.log('\n--> Submit Transaction: UpdateAsset asset70, asset70 does not exist and should return an error');
				await contract.submitTransaction('UpdateAsset', 'asset70', 'blue', '5', 'Tomoko', '300');
				console.log('******** FAILED to return an error');
			} catch (error) {
				console.log(`*** Successfully caught the error: \n    ${error}`);
			}

			console.log('\n--> Submit Transaction: TransferAsset asset1, transfer to new owner of Tom');
			await contract.submitTransaction('TransferAsset', 'asset1', 'Tom');
			console.log('*** Result: committed');

			console.log('\n--> Evaluate Transaction: ReadAsset, function returns "asset1" attributes');
			result = await contract.evaluateTransaction('ReadAsset', 'asset1');
			console.log(`*** Result: ${prettyJSONString(result.toString())}`);
			---*/
		} finally {
			// Disconnect from the gateway when the application is closing
			// This will close all connections to the network
			gateway.disconnect();
		}
	} catch (error) {
		console.error(`******** FAILED to run the application: ${error}`);
	}
}

main();