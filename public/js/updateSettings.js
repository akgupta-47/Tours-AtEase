import axios from 'axios';
import { showAlert } from './alerts.js';

// type will be password or data
export const updateSettings = async (data, type) => {
  try {
    const url =
      type === 'password'
        ? '/api/v1/users/updateMyPassword'
        : '/api/v1/users/updateMe';

    const res = await axios({
      method: 'PATCH',
      url,
      data,
    });

    if (res.data.status === 'success')
      showAlert(
        'success',
        `${type.toUpperCase()} Changes Updated Successfully`
      );
  } catch (error) {
    showAlert('error', error.response.data.message);
  }
};
