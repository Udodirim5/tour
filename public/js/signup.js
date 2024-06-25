/* eslint-disable */

const signup = async (name, email, password, passwordConfirm) => {
  try {
    console.log(name, email, password, passwordConfirm);
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

    alert('Sign up successful:');
  } catch (err) {
    alert('Error Signing up:', err.response ? err.response.data : err.message);
  }
};
document.querySelector('.form').addEventListener('submit', e => {
  e.preventDefault();
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const passwordConfirm = document.getElementById('passwordConfirm').value;
  signup(name, email, password, passwordConfirm);
});
