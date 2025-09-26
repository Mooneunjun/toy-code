let currentPlayer = "player1";
let score = {
  player1: 0,
  player2: 0,
};
let gameboard = [null, null, null, null, null, null, null, null, null];
let isGameEnd = false;
let winner = null;

document.querySelectorAll(".cell").forEach((el, idx) => {
  el.addEventListener("click", () => handleCellClick(idx));
});

function handleCellClick(idx) {
  if (isGameEnd) {
    gameboard = [null, null, null, null, null, null, null, null, null];
    isGameEnd = false;
    winner = null;
    currentPlayer = currentPlayer === "player1" ? "player2" : "player1";
  } else {
    if (gameboard[idx] !== null) return;

    gameboard[idx] = currentPlayer;
    checkGameEnd();

    if (!isGameEnd) {
      currentPlayer = currentPlayer === "player1" ? "player2" : "player1";
    }
  }

  render();
}

function render() {
  document.getElementById("player1-score").textContent = score.player1;
  document.getElementById("player2-score").textContent = score.player2;

  document.querySelectorAll(".cell").forEach((cellEl, idx) => {
    cellEl.className = `cell ${gameboard[idx]}`;
  });

  const turnIcon = document.querySelector(".turn-icon");
  const turnMessage = document.getElementById("turn-message");

  if (!isGameEnd) {
    turnIcon.classList.toggle("player1", currentPlayer === "player1");
    turnIcon.classList.toggle("player2", currentPlayer === "player2");
    turnMessage.textContent = "Turn";
  } else if (winner) {
    turnIcon.classList.toggle("player1", currentPlayer === "player1");
    turnIcon.classList.toggle("player2", currentPlayer === "player2");
    turnMessage.textContent = "Win";
  } else {
    turnIcon.classList.toggle("player1", false);
    turnIcon.classList.toggle("player2", false);
    turnMessage.textContent = "Draw";
  }
}

const conditions = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

function checkGameEnd() {
  const currentPlayerWon = conditions.some((condition) =>
    condition.every((idx) => gameboard[idx] === currentPlayer)
  );

  if (currentPlayerWon) {
    score[currentPlayer] += 1;
    isGameEnd = true;
    winner = currentPlayer;
  }

  if (gameboard.every((cell) => cell !== null)) {
    isGameEnd = true;
  }
}
