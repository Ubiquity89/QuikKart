import Axios from "./Axios";
import SummaryApi from "../common/SummaryApi";

/**
 * Fetches the current user's details from the server
 * @returns {Promise<Object|null>} User data if successful, null otherwise
 */
const fetchUserDetails = async () => {
    try {
        const response = await Axios({
            ...SummaryApi.userDetails,
            timeout: 10000, // 10 seconds timeout
            validateStatus: (status) => status < 500 // Don't throw for 401/403
        });

        // If the response is successful, return the data
        if (response?.data?.success) {
            return response.data;
        }

        // If the user is not authenticated, return null
        if (response?.status === 401 || response?.status === 403) {
            return null;
        }

        // For other errors, log and return null
        console.error('Failed to fetch user details:', response?.data?.message || 'Unknown error');
        return null;
    } catch (error) {
        // Handle network errors or timeouts
        if (error.code === 'ECONNABORTED') {
            console.error('Request timed out while fetching user details');
        } else if (!error.response) {
            console.error('Network error while fetching user details');
        }
        
        return null;
    }
};

export default fetchUserDetails;