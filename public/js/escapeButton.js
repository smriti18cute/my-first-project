const form = document.getElementById('loginForm');
const loginBtn = document.getElementById('loginBtn');
const nameInput = document.getElementById('name');
const passInput = document.getElementById('password');
const formBox = document.querySelector('.form-box');

function inputsValid(){
  return nameInput.value.trim().length >= 3 && passInput.value.trim().length >= 6;
}
function moveButtonRandom(){
  const maxX = formBox.clientWidth - loginBtn.clientWidth - 10;
  const maxY = formBox.clientHeight - loginBtn.clientHeight - 10;
  const randomX = Math.floor(Math.random() * maxX);
  const randomY = Math.floor(Math.random() * maxY);
  loginBtn.style.transform = `translate(${randomX}px, ${randomY}px)`;
}
function dodgeIfInvalid(){
  if (!inputsValid()){
    moveButtonRandom();
  } else {
    loginBtn.style.transform = 'translate(-50%, 0)';
  }
}
// Desktop hover dodge
loginBtn.addEventListener('mouseover', dodgeIfInvalid);
// Mobile tap dodge
loginBtn.addEventListener('touchstart', (e) => {
  if (!inputsValid()){
    e.preventDefault();
    moveButtonRandom();
  }
}, {passive:false});
// Re-validate while typing
[ nameInput, passInput ].forEach(el => {
  el.addEventListener('input', () => {
    if (inputsValid()){
      nameInput.classList.add('is-valid');
      passInput.classList.add('is-valid');
    } else {
      nameInput.classList.remove('is-valid');
      passInput.classList.remove('is-valid');
    }
  });
});
// Prevent submit if invalid
form.addEventListener('submit', (e) => {
  if (!inputsValid()){
    e.preventDefault();
    moveButtonRandom();
  }
});
