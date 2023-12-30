// ClientHome.js
import React from 'react';

const ClientHome = ({ allUserSeats, handleSeatToggle, selectedSeats, handleSubmitSeats }) => {
  return (
    <div>
      {Object.entries(allUserSeats).map(([adminUid, adminSeats]) => (
        <div key={adminUid}>
          <h3>Admin UID: {adminUid}</h3>
          <table>
            <thead>
              <tr>
                <th>Seat ID</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(adminSeats).map(([seatId, status]) => (
                <tr key={seatId}>
                  <td>{seatId}</td>
                  <td>{status ? 'Occupied' : 'Not Occupied'}</td>
                  <td>
                    {status === false && (
                      <button type="button" onClick={() => handleSeatToggle(adminUid, seatId)}>
                        {selectedSeats.find((seat) => seat.adminUid === adminUid && seat.seatId === seatId)
                          ? 'Deselect'
                          : 'Select'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
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
    </div>
  );
};

export default ClientHome;
