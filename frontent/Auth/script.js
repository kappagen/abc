// Input and animation element references
let usernameInput = document.querySelector(".username");
let emailInput = document.querySelector(".email");
let face = document.querySelector(".face");
let tongue = document.querySelector(".tongue");
let passwordInputs = document.querySelectorAll(".password");
let showPasswordButtons = document.querySelectorAll(".password-button");

// Eye icon assets
const eyeOpen = "svg/visibility_31dp_000000_FILL1_wght400_GRAD0_opsz24.svg";
const eyeClosed = "svg/visibility_off_31dp_000000_FILL1_wght400_GRAD0_opsz24.svg";

// Update both hands to a single state: normal, hide, or peek
function setHands(mode) {
  document.querySelectorAll(".hand").forEach((hand) => {
    hand.classList.remove("hide", "peek");
    if (mode) hand.classList.add(mode);
  });
}

// Move face based on current input length
function trackFace(input) {
  if (!input || !face) return;

  input.addEventListener("focus", () => {
    let length = Math.min(input.value.length - 16, 19);
    setHands();
    face.style.setProperty("--rotate-head", `${-length}deg`);
  });

  input.addEventListener("blur", () => {
    face.style.setProperty("--rotate-head", "0deg");
  });

  input.addEventListener(
    "input",
    _.throttle((event) => {
      let length = Math.min(event.target.value.length - 16, 19);
      face.style.setProperty("--rotate-head", `${-length}deg`);
    }, 100)
  );
}

// Face follows username and email typing
trackFace(usernameInput);
trackFace(emailInput);

// Password focus controls hand + tongue animation
passwordInputs.forEach((passwordInput) => {
  passwordInput.addEventListener("focus", () => {
    setHands("hide");
    if (tongue) tongue.classList.remove("breath");
  });

  passwordInput.addEventListener("blur", () => {
    setHands();
    if (tongue) tongue.classList.add("breath");
  });
});

// Eye button toggles password visibility and icon
showPasswordButtons.forEach((showPasswordButton) => {
  showPasswordButton.addEventListener("click", (event) => {
    event.preventDefault();

    let passwordInput = showPasswordButton
      .closest("label")
      ?.querySelector(".password");
    let eyeIcon = showPasswordButton.querySelector(".eyeIcon");
    if (!passwordInput || !eyeIcon) return;

    if (passwordInput.type === "password") {
      passwordInput.type = "text";
      eyeIcon.src = eyeClosed;
      setHands("peek");
    } else {
      passwordInput.type = "password";
      eyeIcon.src = eyeOpen;
      setHands("hide");
    }
  });
});

// Ensure icon matches initial input type on page load
showPasswordButtons.forEach((showPasswordButton) => {
  let passwordInput = showPasswordButton.closest("label")?.querySelector(".password");
  let eyeIcon = showPasswordButton.querySelector(".eyeIcon");
  if (!passwordInput || !eyeIcon) return;

  eyeIcon.src = passwordInput.type === "password" ? eyeOpen : eyeClosed;
});
