// showTitle 함수를 완성해 주세요
function showTitle(e) {
  // 여기에 코드를 작성하세요
  const target = e.target.closest("[data-title]");

  if (target && !target.querySelector(".title")) {
    const span = document.createElement("span");
    span.classList.add("title");
    span.textContent = target.dataset.title;
    target.append(span);
  }
}

// removeTitle 함수를 완성해 주세요
function removeTitle(e) {
  // 여기에 코드를 작성하세요
  const target = e.target.closest("[data-title]");
  const realTarget = e.relatedTarget;

  if (target && !target.contains(realTarget)) {
    target.querySelector(".title").remove();
  }
}

const map = document.querySelector(".map");

// '대상'과 '타입'을 수정해 주세요
map.addEventListener("mouseover", (e) => {
  showTitle(e);
});
map.addEventListener("mouseout", (e) => {
  const target = e.target.closest("[data-title]");

  if (target) {
    removeTitle(e);
  }
});
