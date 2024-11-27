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
