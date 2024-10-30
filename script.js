document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('gridCanvas');
  const ctx = canvas.getContext('2d');
  const generationDisplay = document.getElementById('generation');
  const playPauseButton = document.getElementById('playPause');

  // Grid configuration
  const CELL_SIZE = 20;
  const PADDING = 1;
  let grid = [];
  let isDrawing = false;
  let lastCell = { row: -1, col: -1 };
  let isRunning = false;
  let generation = 0;
  let animationId = null;
  let userChanges = new Set(); // Track cells changed during current generation

  // Initialize the canvas and grid
  function initialize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const cols = Math.floor(canvas.width / CELL_SIZE);
    const rows = Math.floor(canvas.height / CELL_SIZE);

    grid = Array(rows)
      .fill()
      .map(() => Array(cols).fill(false));

    generation = 0;
    updateGenerationDisplay();
    drawGrid();
  }

  function drawGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let row = 0; row < grid.length; row++) {
      for (let col = 0; col < grid[row].length; col++) {
        const x = col * CELL_SIZE;
        const y = row * CELL_SIZE;

        ctx.fillStyle = grid[row][col] ? '#4CAF50' : '#eee';
        ctx.fillRect(
          x + PADDING,
          y + PADDING,
          CELL_SIZE - PADDING * 2,
          CELL_SIZE - PADDING * 2,
        );
      }
    }
  }

  function getGridPosition(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    return {
      row: Math.floor(y / CELL_SIZE),
      col: Math.floor(x / CELL_SIZE),
    };
  }

  function toggleCell(row, col) {
    if (
      row >= 0 &&
      row < grid.length &&
      col >= 0 &&
      col < grid[0].length &&
      (row !== lastCell.row || col !== lastCell.col)
    ) {
      grid[row][col] = !grid[row][col];
      lastCell = { row, col };
      userChanges.add(`${row},${col}`); // Track user change
      drawGrid();
    }
  }

  function countNeighbors(row, col) {
    let count = 0;
    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        if (i === 0 && j === 0) continue;
        const newRow = row + i;
        const newCol = col + j;
        if (
          newRow >= 0 &&
          newRow < grid.length &&
          newCol >= 0 &&
          newCol < grid[0].length &&
          grid[newRow][newCol]
        ) {
          count++;
        }
      }
    }
    return count;
  }

  function updateGenerationDisplay() {
    generationDisplay.textContent = `Generation: ${generation}`;
  }

  function nextGeneration() {
    const newGrid = grid.map((row) => [...row]);

    for (let row = 0; row < grid.length; row++) {
      for (let col = 0; col < grid[row].length; col++) {
        if (userChanges.has(`${row},${col}`)) continue;

        const neighbors = countNeighbors(row, col);

        if (grid[row][col]) {
          newGrid[row][col] = neighbors === 2 || neighbors === 3;
        } else {
          newGrid[row][col] = neighbors === 3;
        }
      }
    }

    userChanges.clear();
    grid = newGrid;
    generation++;
    updateGenerationDisplay();
    drawGrid();
  }

  function gameLoop() {
    if (isRunning) {
      nextGeneration();
      animationId = setTimeout(gameLoop, 100);
    }
  }

  // Event handlers
  function handleStart(event) {
    event.preventDefault();
    isDrawing = true;
    const pos = getGridPosition(
      event.clientX || event.touches[0].clientX,
      event.clientY || event.touches[0].clientY,
    );
    toggleCell(pos.row, pos.col);
  }

  function handleMove(event) {
    if (!isDrawing) return;
    event.preventDefault();
    const pos = getGridPosition(
      event.clientX || event.touches[0].clientX,
      event.clientY || event.touches[0].clientY,
    );
    toggleCell(pos.row, pos.col);
  }

  function handleEnd(event) {
    event.preventDefault();
    isDrawing = false;
    lastCell = { row: -1, col: -1 };
  }

  // Controls
  playPauseButton.addEventListener('click', () => {
    console.log('Play/Pause button clicked');
    isRunning = !isRunning;
    playPauseButton.textContent = isRunning ? 'Pause' : 'Play';
    if (isRunning) {
      gameLoop();
    } else {
      clearTimeout(animationId);
    }
  });

  document.getElementById('clear').addEventListener('click', () => {
    console.log('Clear button clicked');
    isRunning = false;
    playPauseButton.textContent = 'Play';
    clearTimeout(animationId);
    initialize();
  });

  document.getElementById('random').addEventListener('click', () => {
    console.log('Random button clicked');
    for (let row = 0; row < grid.length; row++) {
      for (let col = 0; col < grid[row].length; col++) {
        grid[row][col] = Math.random() < 0.3;
      }
    }
    drawGrid();
  });

  // Mouse events
  canvas.addEventListener('mousedown', handleStart);
  canvas.addEventListener('mousemove', handleMove);
  canvas.addEventListener('mouseup', handleEnd);
  canvas.addEventListener('mouseleave', handleEnd);

  // Touch events
  canvas.addEventListener('touchstart', handleStart);
  canvas.addEventListener('touchmove', handleMove);
  canvas.addEventListener('touchend', handleEnd);
  canvas.addEventListener('touchcancel', handleEnd);

  window.addEventListener('resize', initialize);

  // Initial setup
  initialize();
});
