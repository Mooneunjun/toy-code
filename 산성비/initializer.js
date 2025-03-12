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
  span.style.top = `0px`;
  span.style.left = `${getRandomInt(20, maxPositionX)}px`;
  span.dataset.word = word;
  span.textContent = word;
  container.append(span);

  fallWord(span);
}

function fallWord(element) {
  let positionY = 0;
  const speed = getRandomInt(1, 3);

  const interval = setInterval(() => {
    positionY += speed;
    element.style.top = `${positionY}px`;
    element.dataset.positionY = positionY;

    if (positionY >= container.offsetHeight - 50) {
      clearInterval(interval);
      element.remove();
    }
  }, 50);
}

setInterval(createWord, 1400);
