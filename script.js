function showPanel(panelId) {
  const panels = document.querySelectorAll(".panel");
  const links = document.querySelectorAll(".sidebar a");

  // 모든 패널에서 active 클래스 제거
  panels.forEach((panel) => {
    panel.classList.remove("active");
  });

  // 모든 링크에서 active 클래스 제거
  links.forEach((link) => {
    link.classList.remove("active");
  });

  // 클릭한 패널과 링크에 active 클래스 추가
  document.getElementById(panelId).classList.add("active");
  document
    .querySelector(`a[onclick="showPanel('${panelId}')"]`)
    .classList.add("active");
}


function toggleLanguagePopup() {
  const popup = document.getElementById('languagePopup');
  popup.style.display = popup.style.display === 'block' ? 'none' : 'block';
}

function setLanguage(language) {
  const languageBtn = document.querySelector('.language-btn');
  const languageItems = document.querySelectorAll('.language-popup li');
  
  languageItems.forEach(item => {
    item.classList.remove('active');
  });

  switch (language) {
    case 'ko':
      languageBtn.textContent = '한국어';
      document.querySelector('.language-popup li[onclick="setLanguage(\'ko\')"]').classList.add('active');
      break;
    case 'en':
      languageBtn.textContent = 'English';
      document.querySelector('.language-popup li[onclick="setLanguage(\'en\')"]').classList.add('active');
      break;
    case 'zh':
      languageBtn.textContent = '中文';
      document.querySelector('.language-popup li[onclick="setLanguage(\'zh\')"]').classList.add('active');
      break;
  }
  toggleLanguagePopup();
}

// 팝업 외부를 클릭하면 팝업을 닫는 이벤트 리스너 추가
window.addEventListener('click', function(event) {
  const popup = document.getElementById('languagePopup');
  if (!event.target.matches('.language-btn')) {
    if (popup.style.display === 'block') {
      popup.style.display = 'none';
    }
  }
});