document.getElementById('register-form').onsubmit = () => {
  let password = document.getElementById('password-input');
  let retypedPassword = document.getElementById('retyped-password-input');
  
  if(password.value != retypedPassword.value) {
    return false;
  }

  return true;
};