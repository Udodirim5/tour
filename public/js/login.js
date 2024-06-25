/* eslint-disable */
document.addEventListener('DOMContentLoaded', () => {
  const login = async (email, password) => {
    try {
      const res = await axios({
        method: 'POST',
        url: 'http://localhost:4000/api/v1/users/login', // Update the URL as needed
        data: {
          email,
          password
        }
      });
      if(res.data.status === 'success') {
        window.setTimeout(() => {
          location.assign('/');
        }, 1000);
      }

      alert('Login successful:');
    } catch (err) {
      alert('Error logging in:', err.response ? err.response.data : err.message);
    }
  };

  document.querySelector('.form').addEventListener('submit', e => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });
});
