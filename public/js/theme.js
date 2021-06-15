function applyTheme(selectedTheme) {
  let body = document.getElementsByTagName('body')[0];
  let themeIcon = document.getElementById('theme-switch');

  if (selectedTheme) {
    body.classList.add('light');
    themeIcon.src = '/public/pictures/moon.png';
    
  } else {
    body.classList.remove('light');
    themeIcon.src = '/public/pictures/sun.png'
  }
  themeIcon.style.display = 'inline';
}

function switchTheme() {
  // 0 for dark, 1 for light;
  let selectedTheme = parseInt(localStorage.getItem('theme'));

  // set default to 0 (dark), if no theme selected;
  if (!selectedTheme) {
    selectedTheme = 0;
    localStorage.setItem('theme', 0);
  }

  // switch theme;
  selectedTheme += 1;
  selectedTheme %= 2;

  applyTheme(selectedTheme);

  localStorage.setItem('theme', selectedTheme);
}

window.onload = () => {
  document.getElementById('theme-switch').onclick = () => {
    switchTheme();
  }
}
