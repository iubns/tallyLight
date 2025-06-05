import axios from "axios"
import dotenv from "dotenv"

dotenv.config()

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 10000, // 10 seconds
})
axiosInstance.interceptors.request.use((config) => {
  // Add any request-specific logic here, like adding headers
  return config
})
axiosInstance.interceptors.response.use(
  (response) => {
    // Handle successful responses
    return response
  },
  (error) => {
    // Handle errors globally
    if (error.response) {
      // The request was made and the server responded with a status code
      console.error("Error response:", error.response.data)
    } else if (error.request) {
      // The request was made but no response was received
      console.error("Error request:", error.request)
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error("Error message:", error.message)
    }
    return Promise.reject(error)
  }
)
export default axiosInstance
