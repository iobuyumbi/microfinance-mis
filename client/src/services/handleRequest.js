// src/services/handleRequest.js
export const handleRequest = async (apiCall, errorMessage = 'Request failed') => {
  try {
    const res = await apiCall();
    return res.data; // or res.data.data if your backend wraps payloads that way
  } catch (error) {
    if (!error.response) {
      throw new Error("Network error – please check your internet connection.");
    }
    throw new Error(error.response?.data?.message || errorMessage);
  }
};
