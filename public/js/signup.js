/* eslint-disable */
import axios from "axios";
import { showAlert } from './alert';

export const signup = async (name, email, password, passwordConfirm) => {
  try {
    const res = await axios({
      method: 'POST',
      url: 'http://localhost:4000/api/v1/users/signup',
      data: {
        name,
        email,
        password,
        passwordConfirm
      }
    });
    if(res.data.status === 'success') {
      window.setTimeout(() => {
        location.assign('/');
      }, 1000);
    }

    showAlert( 'success', 'Sign up successful:');
  } catch (err) {
    showAlert( 'error', err.response.data.message);
  }
};
