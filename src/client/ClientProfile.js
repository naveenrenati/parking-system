// ClientProfile.js
import React from 'react';

const ClientProfile = ({ userData }) => {
  if (!userData) {
    // You can render a loading state or handle it based on your requirements
    return <p>Loading...</p>;
  }

  return (
    <div>
      <h2>Welcome to the Client Dashboard</h2>
      <p>Email: {userData.email}</p>
      <p>Name: {userData.name}</p>
      <p>ID: {userData.userId}</p>
      <p>Role: {userData.role}</p>
    </div>
  );
};

export default ClientProfile;
