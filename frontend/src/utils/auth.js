// frontend/src/utils/auth.js

// Get JWT token from localStorage
export const getToken = () => {
  return localStorage.getItem('token'); // Replace 'token' if your key is different
};

// Save JWT token to localStorage
export const setToken = (token) => {
  localStorage.setItem('token', token);
};

// Remove JWT token from localStorage (logout)
export const removeToken = () => {
  localStorage.removeItem('token');
};

// Check if user is logged in
export const isLoggedIn = () => {
  return !!getToken();
};
