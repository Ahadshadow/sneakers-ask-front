// Test file to verify auth API integration
// This file can be used to test the auth API endpoints

import { authApi } from './auth';

// Test login function
export const testLogin = async () => {
  try {
    console.log('Testing login API...');
    
    const response = await authApi.login({
      email: 'umairjan@example.com',
      password: 'password123'
    });
    
    console.log('Login successful:', response);
    return response;
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
};

// Test get current user function
export const testGetCurrentUser = async () => {
  try {
    console.log('Testing get current user API...');
    
    const response = await authApi.getCurrentUser();
    
    console.log('Get current user successful:', response);
    return response;
  } catch (error) {
    console.error('Get current user failed:', error);
    throw error;
  }
};

// Test logout function
export const testLogout = async () => {
  try {
    console.log('Testing logout API...');
    
    const response = await authApi.logout();
    
    console.log('Logout successful:', response);
    return response;
  } catch (error) {
    console.error('Logout failed:', error);
    throw error;
  }
};

// Run all tests
export const runAuthTests = async () => {
  console.log('🚀 Starting Auth API Tests...');
  
  try {
    // Test login
    await testLogin();
    
    // Test get current user
    await testGetCurrentUser();
    
    // Test logout
    await testLogout();
    
    console.log('✅ All auth tests passed!');
  } catch (error) {
    console.error('❌ Auth tests failed:', error);
  }
};

// Export for console testing
if (typeof window !== 'undefined') {
  (window as any).testAuth = {
    testLogin,
    testGetCurrentUser,
    testLogout,
    runAuthTests
  };
}
