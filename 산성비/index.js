const input = document.querySelector("#input");
let currentMatchedWord = null;

function checker() {
  const remainingWords = document.querySelectorAll(".word");
  if (remainingWords.length === 0) {
    alert("Success!👏🏻");
    if (confirm("retry?")) window.location.reload();
  }
}

function highlightMatch(text, inputText) {
  return `<span style="color: red;">${text.slice(
    0,
    inputText.length
  )}</span>${text.slice(inputText.length)}`;
}

function findBottomMostMatch(inputText) {
  const words = Array.from(document.querySelectorAll(".word"));
  const matchedWords = words.filter(
    (word) => word.dataset.word.startsWith(inputText) // 대소문자 구분 철저히 반영
  );
  if (matchedWords.length === 0) return null;

  matchedWords.sort((a, b) => b.dataset.positionY - a.dataset.positionY);
  return matchedWords[0];
}

function updateHighlight() {
  const inputText = input.value;

  document.querySelectorAll(".word").forEach((word) => {
    word.innerHTML = word.dataset.word;
  });

  if (inputText === "") {
    currentMatchedWord = null;
    return;
  }

  const newMatchedWord = findBottomMostMatch(inputText);
  if (newMatchedWord !== currentMatchedWord) {
    currentMatchedWord = newMatchedWord;
  }

  if (currentMatchedWord) {
    currentMatchedWord.innerHTML = highlightMatch(
      currentMatchedWord.dataset.word,
      inputText
    );
  } else {
    currentMatchedWord = null;
  }
}

function monitorMatchedWord() {
  const newMatchedWord = findBottomMostMatch(input.value);
  if (newMatchedWord !== currentMatchedWord) {
    updateHighlight();
  }
}

setInterval(monitorMatchedWord, 100);

function removeWord() {
  const inputText = input.value;
  const targetWord = findBottomMostMatch(inputText);

  if (targetWord && targetWord.dataset.word === inputText) {
    targetWord.remove();
    checker();
  }

  input.value = "";
  updateHighlight();
}

input.addEventListener("input", updateHighlight);
input.addEventListener("change", removeWord);
