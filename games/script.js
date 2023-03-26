const BOARD_SIZE = 9;
const NUM_BOMBS = 10;

// 生成雷区
function generateBoard() {
  const board = [];

  for (let i = 0; i < BOARD_SIZE; i++) {
    const row = [];

    for (let j = 0; j < BOARD_SIZE; j++) {
      row.push({
        row: i,
        col: j,
        isBomb: false,
        isRevealed: false,
        isFlagged: false,
        neighborBombCount: 0
      });
    }

    board.push(row);
  }

  // 随机放置地雷
  let bombsPlaced = 0;

  while (bombsPlaced < NUM_BOMBS) {
    const randomRow = Math.floor(Math.random() * BOARD_SIZE);
    const randomCol = Math.floor(Math.random() * BOARD_SIZE);

    if (!board[randomRow][randomCol].isBomb) {
      board[randomRow][randomCol].isBomb = true;
      bombsPlaced++;
    }
  }

  // 计算每个方块周围地雷数
  for (let i = 0; i < BOARD_SIZE; i++) {
    for (let j = 0; j < BOARD_SIZE; j++) {
      const currentSquare = board[i][j];

      if (!currentSquare.isBomb) {
        let neighborBombCount = 0;

        for (let ii = -1; ii <= 1; ii++) {
          for (let jj = -1; jj <= 1; jj++) {
            if (ii === 0 && jj === 0) continue;

            const neighborRow = i + ii;
            const neighborCol = j + jj;

            if (
              neighborRow < 0 ||
              neighborRow >= BOARD_SIZE ||
              neighborCol < 0 ||
              neighborCol >= BOARD_SIZE
            ) {
              continue;
            }

            if (board[neighborRow][neighborCol].isBomb) {
              neighborBombCount++;
            }
          }
        }

        currentSquare.neighborBombCount = neighborBombCount;
      }
    }
  }

  return board;
}

// 渲染雷区
function renderBoard(board, boardElement) {
  boardElement.innerHTML = '';

// 遍历每个方块并添加到 DOM 中
for (let i = 0; i < BOARD_SIZE; i++) {
for (let j = 0; j < BOARD_SIZE; j++) {
const square = board[i][j];
	const squareElement = document.createElement('div');
    squareElement.dataset.row = square.row;
    squareElement.dataset.col = square.col;
    squareElement.classList.add('square');

    if (square.isRevealed) {
      squareElement.classList.add('revealed');

      if (square.isBomb) {
        squareElement.classList.add('bomb');
        squareElement.innerHTML = '&#128163;';
      } else if (square.neighborBombCount > 0) {
        squareElement.innerHTML = square.neighborBombCount;
      }
    } else if (square.isFlagged) {
      squareElement.classList.add('flagged');
      squareElement.innerHTML = '&#9873;';
    }

    boardElement.appendChild(squareElement);
  }
}
}

// 处理点击事件
function handleSquareClick(square, board) {
if (square.isRevealed || square.isFlagged) {
return;
}

if (square.isBomb) {
revealBoard(board);
alert('游戏结束，你输了！');
} else {
	revealSquare(square, board);
if (checkForWin(board)) {
  revealBoard(board);
  alert('恭喜你，你赢了！');
}
}
}

// 处理右键点击事件
function handleSquareRightClick(square) {
if (square.isRevealed) {
return;
}

square.isFlagged = !square.isFlagged;
renderBoard(board, boardElement);
}

// 揭开方块
function revealSquare(square, board) {
square.isRevealed = true;

if (square.neighborBombCount === 0) {
// 如果该方块周围没有地雷，则递归揭开周围所有方块
	const neighbors = getNeighbors(square, board);
for (let i = 0; i < neighbors.length; i++) {
  const neighbor = neighbors[i];

  if (!neighbor.isRevealed) {
    revealSquare(neighbor, board);
  }
}
}
}

// 揭开所有方块
function revealBoard(board) {
for (let i = 0; i < BOARD_SIZE; i++) {
for (let j = 0; j < BOARD_SIZE; j++) {
board[i][j].isRevealed = true;
}
}

renderBoard(board, boardElement);
}

// 获取周围的方块
function getNeighbors(square, board) {
const neighbors = [];

for (let ii = -1; ii <= 1; ii++) {
for (let jj = -1; jj <= 1; jj++) {
	if (ii === 0 && jj === 0) continue;
  const neighborRow = square.row + ii;
  const neighborCol = square.col + jj;

  if (
    neighborRow < 0 ||
    neighborRow >= BOARD_SIZE ||
    neighborCol < 0 ||
    neighborCol >= BOARD_SIZE
  ) {
    continue;
  }

  neighbors.push(board[neighborRow][neighborCol]);
}
  const neighborRow = square.row + ii;
  const neighborCol = square.col + jj;

  if (
    neighborRow < 0 ||
    neighborRow >= BOARD_SIZE ||
    neighborCol < 0 ||
    neighborCol >= BOARD_SIZE
  ) {
    continue;
  }

  neighbors.push(board[neighborRow][neighborCol]);
}
}

return neighbors;
}

// 检查是否获胜
function checkForWin(board) {
for (let i = 0; i < BOARD_SIZE; i++) {
// for (let j = 0; j < BOARD// 如果还有未揭开的方块并且不是地雷，则游戏未结束
if (
!board[i][j].isRevealed &&
!board[i][j].isBomb
) {
return false;
}
}

return true;
}

// 初始化游戏
function init() {
board = generateBoard();
renderBoard(board, boardElement);
}
// 开始游戏
init();

// 处理重玩按钮点击事件
resetButton.addEventListener('click', () => {
boardElement.innerHTML = '';
init();
});