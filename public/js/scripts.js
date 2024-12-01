// Selectors for authentication-related elements
const authContainer = document.querySelector(".auth-container");
const pwShowHide = document.querySelectorAll(".showHidePw");
const pwFields = document.querySelectorAll(".auth-password");
const signUpLink = document.querySelector(".signup-link");
const loginLink = document.querySelector(".login-link");

// Debugging - Check if elements are selected
if (pwShowHide.length === 0) {
  console.error("Password toggle icons (showHidePw) not found.");
}
if (pwFields.length === 0) {
  console.error("Password input fields (auth-password) not found.");
}

// JS code to show/hide password and change the icon
pwShowHide.forEach((eyeIcon) => {
  eyeIcon.addEventListener("click", () => {
    pwFields.forEach((pwField) => {
      if (pwField.type === "password") {
        pwField.type = "text";
        eyeIcon.classList.replace("uil-eye-slash", "uil-eye");
      } else {
        pwField.type = "password";
        eyeIcon.classList.replace("uil-eye", "uil-eye-slash");
      }
    });
  });
});

// JS code to toggle between signup and login forms
if (signUpLink) {
  signUpLink.addEventListener("click", (e) => {
    e.preventDefault();
    authContainer.classList.add("active");
  });
}

if (loginLink) {
  loginLink.addEventListener("click", (e) => {
    e.preventDefault();
    authContainer.classList.remove("active");
  });
}
