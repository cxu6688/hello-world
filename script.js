const sections = document.querySelectorAll('.lockable');
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('unlocked');
      }
    });
  },
  { threshold: 0.35 }
);
sections.forEach((section) => observer.observe(section));

document.querySelectorAll('.flip-card').forEach((card) => {
  card.addEventListener('click', () => card.classList.toggle('flipped'));
});

const wishButton = document.getElementById('wish-button');
const confettiCanvas = document.getElementById('confetti-canvas');
const ctx = confettiCanvas.getContext('2d');
let confettiPieces = [];

function sizeCanvas() {
  confettiCanvas.width = window.innerWidth;
  confettiCanvas.height = window.innerHeight;
}
window.addEventListener('resize', sizeCanvas);
sizeCanvas();

function launchConfetti() {
  confettiPieces = Array.from({ length: 180 }, () => ({
    x: Math.random() * confettiCanvas.width,
    y: -20 - Math.random() * confettiCanvas.height,
    size: 6 + Math.random() * 6,
    vy: 2 + Math.random() * 3,
    vx: -2 + Math.random() * 4,
    rot: Math.random() * Math.PI,
    vr: -0.15 + Math.random() * 0.3,
    color: ['#ffd166', '#ff7eb6', '#9bf6ff', '#caffbf', '#bdb2ff'][Math.floor(Math.random() * 5)]
  }));

  let frame = 0;
  function animate() {
    frame += 1;
    ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    confettiPieces.forEach((piece) => {
      piece.y += piece.vy;
      piece.x += piece.vx;
      piece.rot += piece.vr;
      ctx.save();
      ctx.translate(piece.x, piece.y);
      ctx.rotate(piece.rot);
      ctx.fillStyle = piece.color;
      ctx.fillRect(-piece.size / 2, -piece.size / 2, piece.size, piece.size * 0.6);
      ctx.restore();
    });

    confettiPieces = confettiPieces.filter((piece) => piece.y < confettiCanvas.height + 30);
    if (frame < 220 && confettiPieces.length) {
      requestAnimationFrame(animate);
    } else {
      ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    }
  }

  requestAnimationFrame(animate);
}

wishButton.addEventListener('click', launchConfetti);

const puzzle = document.getElementById('puzzle');
const puzzleStatus = document.getElementById('puzzle-status');
const shuffleBtn = document.getElementById('shuffle-btn');
const letterSection = document.getElementById('letter-section');

let state = [];
const size = 3;

function createSolvedState() {
  return Array.from({ length: size * size }, (_, i) => i);
}

function renderPuzzle() {
  puzzle.innerHTML = '';
  state.forEach((value, index) => {
    const tile = document.createElement('button');
    tile.type = 'button';
    tile.className = 'tile';

    if (value === size * size - 1) {
      tile.classList.add('empty');
      tile.setAttribute('aria-label', 'Empty space');
      tile.disabled = true;
    } else {
      const x = value % size;
      const y = Math.floor(value / size);
      tile.style.backgroundPosition = `${(x / (size - 1)) * 100}% ${(y / (size - 1)) * 100}%`;
      tile.setAttribute('aria-label', `Puzzle tile ${value + 1}`);
      tile.addEventListener('click', () => moveTile(index));
    }

    puzzle.appendChild(tile);
  });
}

function neighbors(index) {
  const row = Math.floor(index / size);
  const col = index % size;
  const result = [];
  if (row > 0) result.push(index - size);
  if (row < size - 1) result.push(index + size);
  if (col > 0) result.push(index - 1);
  if (col < size - 1) result.push(index + 1);
  return result;
}

function moveTile(index) {
  const emptyIndex = state.indexOf(size * size - 1);
  if (!neighbors(index).includes(emptyIndex)) return;
  [state[index], state[emptyIndex]] = [state[emptyIndex], state[index]];
  renderPuzzle();
  checkSolved();
}

function shuffle(times = 200) {
  state = createSolvedState();
  for (let i = 0; i < times; i += 1) {
    const emptyIndex = state.indexOf(size * size - 1);
    const moves = neighbors(emptyIndex);
    const next = moves[Math.floor(Math.random() * moves.length)];
    [state[emptyIndex], state[next]] = [state[next], state[emptyIndex]];
  }
  puzzleStatus.textContent = 'Arrange the tiles to complete the picture.';
  letterSection.classList.remove('unlocked');
  letterSection.setAttribute('aria-hidden', 'true');
  renderPuzzle();
}

function checkSolved() {
  const solved = state.every((value, i) => value === i);
  if (solved) {
    puzzleStatus.textContent = 'You unlocked it! Scroll down for the final surprise. ❤️';
    letterSection.classList.add('unlocked');
    letterSection.setAttribute('aria-hidden', 'false');
  }
}

shuffleBtn.addEventListener('click', () => shuffle(300));
shuffle();
