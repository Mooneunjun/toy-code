const words = [
  "Codeit",
  "JavaScript",
  "DOM",
  "document",
  "window",
  "Event",
  "Bubbling",
  "Delegation",
];
const container = document.querySelector("#container");

function getRandomInt(minimum, maximum) {
  return Math.floor(Math.random() * (maximum - minimum + 1)) + minimum;
}

function createWord() {
  const maxPositionX = container.offsetWidth - 90;
  const word = words[getRandomInt(0, words.length - 1)];

  const span = document.createElement("span");
  span.classList.add("word");
  span.style.top = `0px`; // 처음 위치를 위쪽으로 설정
  span.style.left = `${getRandomInt(20, maxPositionX)}px`;
  span.dataset.word = word;
  span.textContent = word;
  container.append(span);

  fallWord(span); // 떨어지는 애니메이션 실행
}

function fallWord(element) {
  let positionY = 0;
  const speed = getRandomInt(1, 3); // 더 천천히 떨어지도록 속도 범위 설정 (1~3)

  const interval = setInterval(() => {
    positionY += speed;
    element.style.top = `${positionY}px`;

    if (positionY >= container.offsetHeight - 50) {
      clearInterval(interval);
      element.remove(); // 화면 아래로 벗어나면 제거
    }
  }, 50); // 50ms 간격으로 실행 (더 부드럽고 천천히 떨어짐)
}

// 일정 간격마다 새로운 단어 생성 (1.2초마다 새로운 단어 추가)
setInterval(createWord, 1200);
