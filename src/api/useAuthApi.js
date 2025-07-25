import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const useAuthApi = () => {
  const register = async (formData) => {
    try {
      const response = await axios.post(`${BASE_URL}/authentication/register`, {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      // Simulate success log since backend isn't live
      console.log("✅ Registration API success:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Registration API error:", error.response?.data || error.message);
      throw error;
    }
  };

  return { register };
};

export default useAuthApi;
