const axios = require('axios');
require('dotenv').config({ path: '../.env' });

// Admin user details
const adminUser = {
  username: 'admin',
  email: 'admin@example.com',
  password: 'Admin@123',
  adminSecret: 'admin123456secretkey'
};

// API base URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

async function createAdminUser() {
  try {
    console.log('Creating admin user...');
    const response = await axios.post(`${API_BASE_URL}/api/auth/admin/create`, adminUser);
    console.log('Success:', response.data.msg);
    console.log('\nAdmin user created successfully!');
    console.log('Username:', adminUser.username);
    console.log('Email:', adminUser.email);
    console.log('Password:', adminUser.password);
    console.log('\nYou can now login at: http://localhost:3000/admin/login');
  } catch (error) {
    console.error('Error creating admin user:');
    if (error.response) {
      console.error(error.response.data.msg || 'Server error');
    } else {
      console.error(error.message);
    }
  }
}

createAdminUser();
