import { toast } from 'react-hot-toast';

export const AxiosToastError = (error) => {
    if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        const message = error.response.data?.message || 'An error occurred';
        toast.error(message);
        console.error('Error response:', error.response);
    } else if (error.request) {
        // The request was made but no response was received
        console.error('No response received:', error.request);
        toast.error('No response from server. Please try again.');
    } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error:', error.message);
        toast.error(error.message || 'Something went wrong');
    }
};

export const handleApiError = (error) => {
    if (error?.response?.data?.message) {
        toast.error(error.response.data.message);
    } else {
        toast.error(error.message || 'An error occurred');
    }
    console.error('API Error:', error);
};
