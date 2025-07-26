// src/services/handleRequest.js
export const handleRequest = async (
  apiCall,
  errorMessage = "Request failed"
) => {
  try {
    const response = await apiCall();
    return response.data; // adjust if your API nests data deeper
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error("API call error:", error); // helpful in dev
    }

    if (!error.response) {
      throw new Error("Network error – please check your internet connection.");
    }

    const serverMessage = error.response.data?.message;
    throw new Error(serverMessage || errorMessage);
  }
};
