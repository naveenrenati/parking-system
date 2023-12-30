// Import necessary libraries
import React, { useEffect, useState } from 'react';
import { getAuth, signOut, onAuthStateChanged } from 'firebase/auth';
import { getDatabase, ref, onValue, set } from 'firebase/database';
import QRCode from 'react-qr-code';
import { useNavigate } from 'react-router-dom';

// ClientDashboard component
const ClientDashboard = () => {
  const auth = getAuth();
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [allUserSeats, setAllUserSeats] = useState({});
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [qrCode, setQrCode] = useState(null);
  const [adminDetails, setAdminDetails] = useState({});
  const [selectedAdminPlace, setSelectedAdminPlace] = useState(null);
  const [mobileNumber, setMobileNumber] = useState('');
  const [address, setAddress] = useState('');
  const [carNumber, setCarNumber] = useState('');
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setUser(user);

      if (user) {
        // Fetch user details from Realtime Database
        const db = getDatabase();
        const userRef = ref(db, `users/${user.uid}`);
        onValue(userRef, (snapshot) => {
          const userData = snapshot.val();
          setUserData(userData);

          // Populate profile information
          if (userData) {
            setMobileNumber(userData.mobileNumber || '');
            setAddress(userData.address || '');
            setCarNumber(userData.carNumber || '');
          }
        });

        // Fetch all seat information from userSeats data path
        const userSeatsRef = ref(db, 'userSeats');
        onValue(userSeatsRef, (seatsSnapshot) => {
          const seatsData = seatsSnapshot.val();
          if (seatsData) {
            setAllUserSeats(seatsData);
          }
        });
      }
    });

    return () => unsubscribeAuth();
  }, [auth]);

  useEffect(() => {
    // Fetch admin details based on admin UID
    const fetchAdminDetails = async (adminUid) => {
      const db = getDatabase();
      const adminRef = ref(db, `admin/${adminUid}`);
      onValue(adminRef, (snapshot) => {
        const adminData = snapshot.val();
        setAdminDetails((prevDetails) => ({
          ...prevDetails,
          [adminUid]: adminData,
        }));
      });
    };

    // Fetch admin details for each admin UID in allUserSeats
    Object.keys(allUserSeats).forEach((adminUid) => {
      fetchAdminDetails(adminUid);
    });
  }, [allUserSeats]);

  const handleSeatToggle = (adminUid, seatId) => {
    // Check if the seat is unoccupied
    if (allUserSeats[adminUid] && allUserSeats[adminUid][seatId] === false) {
      // Toggle the selected status of the seat
      setSelectedSeats((prevSeats) => {
        const seatIndex = prevSeats.findIndex((seat) => seat.adminUid === adminUid && seat.seatId === seatId);

        if (seatIndex !== -1) {
          // Seat is already selected, so deselect it
          const updatedSeats = [...prevSeats];
          updatedSeats.splice(seatIndex, 1);
          return updatedSeats;
        } else {
          // Seat is not selected, so select it
          return [...prevSeats, { adminUid, seatId }];
        }
      });
    }
  };

  const handleSubmitSeats = async () => {
    // Generate a unique QR code based on selected seats
    const clientInfo = {
      adminUid: selectedSeats.length > 0 ? selectedSeats[0].adminUid : null,
      name: userData.name,
      email: user.email,
      id: userData.userId,
      seats: selectedSeats.map(({ seatId }) => seatId),
    };
    const qrCodeData = JSON.stringify(clientInfo);
    setQrCode(qrCodeData);

    // Update the userSeats data path with the selected seats
    const db = getDatabase();
    const userSeatsRef = ref(db, 'userSeats');
    const updatedSeats = { ...allUserSeats };

    selectedSeats.forEach(({ adminUid, seatId }) => {
      updatedSeats[adminUid][seatId] = true; // Mark the seat as occupied
    });

    await set(userSeatsRef, updatedSeats);

    // Clear the selected seats after submission
    setSelectedSeats([]);
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/Home-client');
  };

  const handleEditProfile = () => {
    setIsEditingProfile(true);
  };

  const handleSaveProfile = async () => {
    // Update the user profile information in the Realtime Database
    const db = getDatabase();
    const userRef = ref(db, `users/${user.uid}`);
    await set(userRef, {
      ...userData,
      mobileNumber,
      address,
      carNumber,
    });

    setIsEditingProfile(false);
  };

  console.log('Rendering ClientDashboard');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <h2>Welcome to the Client Dashboard</h2>
      {user && (
        <div>
          <p>Email: {user.email}</p>
          {userData && (
            <div>
              <p>Name: {userData.name}</p>
              <p>ID: {userData.userId}</p>
              <p>Role: {userData.role}</p>
            </div>
          )}
          <div>
            <label htmlFor="adminPlace">Select Admin Place:</label>
            <select id="adminPlace" onChange={(e) => setSelectedAdminPlace(e.target.value)}>
              <option value="">Select...</option>
              {Object.keys(adminDetails).map((adminUid) => (
                <option key={adminUid} value={adminUid}>
                  {adminDetails[adminUid].place}
                </option>
              ))}
            </select>
          </div>
          {selectedAdminPlace && (
            <div>
              {/* Fetch admin information based on selectedAdminPlace */}
              {adminDetails[selectedAdminPlace] && (
                <>
                  <h3>Admin UID: {selectedAdminPlace}</h3>
                  <p>Admin Name: {adminDetails[selectedAdminPlace].name}</p>
                  <p>Admin Description: {adminDetails[selectedAdminPlace].description}</p>
                  <p>Admin Place: {adminDetails[selectedAdminPlace].place}</p>
                  <table>
                    <thead>
                      <tr>
                        <th>Seat ID</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(allUserSeats[selectedAdminPlace]).map(([seatId, status]) => (
                        <tr key={seatId}>
                          <td>{seatId}</td>
                          <td>{status ? 'Occupied' : 'Not Occupied'}</td>
                          <td>
                            {status === false && (
                              <button type="button" onClick={() => handleSeatToggle(selectedAdminPlace, seatId)}>
                                {selectedSeats.find((seat) => seat.adminUid === selectedAdminPlace && seat.seatId === seatId)
                                  ? 'Deselect'
                                  : 'Select'}
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}
            </div>
          )}
          {selectedSeats.length > 0 && (
            <div>
              <h3>Selected Seats:</h3>
              <ul>
                {selectedSeats.map(({ adminUid, seatId }) => (
                  <li key={`${adminUid}-${seatId}`}>{`Admin UID: ${adminUid}, Seat ID: ${seatId}`}</li>
                ))}
              </ul>
              <button type="button" onClick={handleSubmitSeats}>
                Submit Seats
              </button>
            </div>
          )}
          {qrCode && (
            <div>
              <h3>QR Code:</h3>
              <QRCode value={qrCode} />
            </div>
          )}
          <div>
            <h3>Profile Information</h3>
            {isEditingProfile ? (
              <>
                <label htmlFor="mobileNumber">Mobile Number:</label>
                <input
                  type="text"
                  id="mobileNumber"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                />
                <br />
                <label htmlFor="address">Address:</label>
                <input type="text" id="address" value={address} onChange={(e) => setAddress(e.target.value)} />
                <br />
                <label htmlFor="carNumber">Car Number:</label>
                <input type="text" id="carNumber" value={carNumber} onChange={(e) => setCarNumber(e.target.value)} />
                <br />
                <button type="button" onClick={handleSaveProfile}>
                  Save Profile
                </button>
              </>
            ) : (
              <>
                <p>Mobile Number: {mobileNumber}</p>
                <p>Address: {address}</p>
                <p>Car Number: {carNumber}</p>
                <button type="button" onClick={handleEditProfile}>
                  Edit Profile
                </button>
              </>
            )}
          </div>
          <button type="button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default ClientDashboard;
