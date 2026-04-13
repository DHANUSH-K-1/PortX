// If using a physical device, replace 'localhost' with your machine's IP address
// For Android Emulator, use '10.0.2.2'
const BASE_URL = 'http://192.168.1.7:5000';

export const API_ENDPOINTS = {
  login: `${BASE_URL}/api/auth/login`,
  register: `${BASE_URL}/api/auth/register`,
  processResume: `${BASE_URL}/api/process-resume`,
  generatePortfolio: (filename: string) => `${BASE_URL}/api/generate-html/${filename}`,
  getPortfolios: `${BASE_URL}/api/portfolios`,
  getPortfolio: (filename: string) => `${BASE_URL}/api/portfolio/${filename}`,
  updatePortfolio: (filename: string) => `${BASE_URL}/api/portfolio/${filename}`,
  deletePortfolio: (filename: string) => `${BASE_URL}/api/portfolio/${filename}/delete`,
  uploadPhoto: `${BASE_URL}/api/upload-photo`,
};

export default BASE_URL;
