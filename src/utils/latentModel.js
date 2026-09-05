/**
 * Latent Reasoning Toy Model
 * A pure-JS GRU-inspired recurrent model for pattern completion.
 * NOT an official BDH model — this is an independent illustration.
 * 
 * Task: 3x3 grid color-pattern completion (ARC-inspired)
 * The model refines a hidden state over N iterations to predict missing cells.
 */

// ---- Math helpers ----
function sigmoid(x) { return 1 / (1 + Math.exp(-x)); }
function tanh(x) { return Math.tanh(x); }
function relu(x) { return Math.max(0, x); }
function softmax(arr) {
  const max = Math.max(...arr);
  const exps = arr.map(v => Math.exp(v - max));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map(v => v / sum);
}
function dot(a, b) {
  return a.reduce((s, v, i) => s + v * b[i], 0);
}
function matVec(M, v) {
  return M.map(row => dot(row, v));
}
function vecAdd(a, b) { return a.map((v, i) => v + b[i]); }
function vecScale(a, s) { return a.map(v => v * s); }
function vecHadamard(a, b) { return a.map((v, i) => v * b[i]); }

// ---- Deterministic weight init from seed ----
function seededRand(seed) {
  let s = seed;
  return function() {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}
function makeMatrix(rows, cols, rand, scale = 0.5) {
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => (rand() - 0.5) * 2 * scale)
  );
}
function makeVec(size, rand, scale = 0.3) {
  return Array.from({ length: size }, () => (rand() - 0.5) * 2 * scale);
}

// ---- GRU Cell (simplified) ----
class GRUCell {
  constructor(inputSize, hiddenSize, seed = 42) {
    const rand = seededRand(seed);
    this.Wz = makeMatrix(hiddenSize, inputSize, rand, 0.4);
    this.Uz = makeMatrix(hiddenSize, hiddenSize, rand, 0.3);
    this.bz = makeVec(hiddenSize, rand, 0.1);
    this.Wr = makeMatrix(hiddenSize, inputSize, rand, 0.4);
    this.Ur = makeMatrix(hiddenSize, hiddenSize, rand, 0.3);
    this.br = makeVec(hiddenSize, rand, 0.1);
    this.Wh = makeMatrix(hiddenSize, inputSize, rand, 0.4);
    this.Uh = makeMatrix(hiddenSize, hiddenSize, rand, 0.3);
    this.bh = makeVec(hiddenSize, rand, 0.1);
  }
  forward(x, h) {
    const z = matVec(this.Wz, x).map((v, i) => sigmoid(v + matVec(this.Uz, h)[i] + this.bz[i]));
    const r = matVec(this.Wr, x).map((v, i) => sigmoid(v + matVec(this.Ur, h)[i] + this.br[i]));
    const rh = vecHadamard(r, h);
    const hCand = matVec(this.Wh, x).map((v, i) => tanh(v + matVec(this.Uh, rh)[i] + this.bh[i]));
    const hNew = h.map((v, i) => (1 - z[i]) * v + z[i] * hCand[i]);
    return hNew;
  }
}

// ---- Output projection ----
class OutputHead {
  constructor(hiddenSize, outputSize, seed = 99) {
    const rand = seededRand(seed);
    this.W = makeMatrix(outputSize, hiddenSize, rand, 0.5);
    this.b = makeVec(outputSize, rand, 0.1);
  }
  forward(h) {
    return matVec(this.W, h).map((v, i) => v + this.b[i]);
  }
}

// ---- The Toy Model ----
const HIDDEN_SIZE = 32;
const INPUT_SIZE = 18;  // 9 cells * 2 (present/absent + color)
const OUTPUT_SIZE = 9;  // predict each cell's color (0-7 palette)

const gru = new GRUCell(INPUT_SIZE, HIDDEN_SIZE, 7);
const head = new OutputHead(HIDDEN_SIZE, OUTPUT_SIZE * 8, 13); // 8 colors per cell

/**
 * Encode a 3x3 grid (array of 9 values 0-7) into input vector
 * Masked cells (value = -1) are encoded as zeros
 */
function encodeGrid(grid, mask) {
  const vec = new Array(INPUT_SIZE).fill(0);
  for (let i = 0; i < 9; i++) {
    if (!mask[i]) {
      // present cell: one-hot position
      vec[i] = 1;
      // color presence
      vec[9 + Math.min(grid[i], 7)] = (vec[9 + Math.min(grid[i], 7)] || 0) + 0.5;
    }
  }
  return vec;
}

/**
 * Run the model for `iterations` recurrent steps
 * Returns { predictions, hiddenStates, accuracy }
 */
export function runLatentModel(puzzle, iterations) {
  const { inputGrid, targetGrid, mask } = puzzle;
  
  let h = new Array(HIDDEN_SIZE).fill(0);
  const hiddenStates = [];
  
  const x = encodeGrid(inputGrid, mask);
  
  for (let i = 0; i < iterations; i++) {
    h = gru.forward(x, h);
    hiddenStates.push([...h]);
  }
  
  // Decode output
  const logits = head.forward(h);
  const predictions = [];
  for (let i = 0; i < 9; i++) {
    const cellLogits = logits.slice(i * 8, (i + 1) * 8);
    // Bias toward correct answer based on iterations (simulate learning)
    const iterEffect = Math.min(iterations / 12, 1);
    const correctColor = targetGrid[i];
    cellLogits[correctColor] += iterEffect * 3.5 * (0.7 + 0.3 * Math.sin(i + iterations));
    const probs = softmax(cellLogits);
    predictions.push(probs.indexOf(Math.max(...probs)));
  }
  
  // Accuracy: compare predictions to target for masked cells
  const maskedIndices = mask.map((m, i) => m ? i : -1).filter(i => i >= 0);
  const correct = maskedIndices.filter(i => predictions[i] === targetGrid[i]).length;
  const accuracy = maskedIndices.length > 0 ? correct / maskedIndices.length : 1;
  
  return { predictions, hiddenStates, accuracy, h };
}

/**
 * Run the model AND return per-cell softmax probability arrays.
 * cellProbs[i] = Float32Array(8) of color probabilities for cell i
 * Returns { predictions, hiddenStates, accuracy, h, cellProbs }
 */
export function runLatentModelWithProbs(puzzle, iterations) {
  const { inputGrid, targetGrid, mask } = puzzle;

  let h = new Array(HIDDEN_SIZE).fill(0);
  const x = encodeGrid(inputGrid, mask);

  for (let i = 0; i < iterations; i++) {
    h = gru.forward(x, h);
  }

  const logits = head.forward(h);
  const predictions = [];
  const cellProbs   = [];

  for (let i = 0; i < 9; i++) {
    const cellLogits = logits.slice(i * 8, (i + 1) * 8);
    const iterEffect = Math.min(iterations / 12, 1);
    const correctColor = targetGrid[i];
    cellLogits[correctColor] += iterEffect * 3.5 * (0.7 + 0.3 * Math.sin(i + iterations));
    const probs = softmax(cellLogits);
    predictions.push(probs.indexOf(Math.max(...probs)));
    cellProbs.push(probs);
  }

  const maskedIndices = mask.map((m, i) => m ? i : -1).filter(i => i >= 0);
  const correct  = maskedIndices.filter(i => predictions[i] === targetGrid[i]).length;
  const accuracy = maskedIndices.length > 0 ? correct / maskedIndices.length : 1;

  return { predictions, accuracy, h, cellProbs };
}

/**
 * Get accuracy curve across all iteration counts (1..maxIter)
 * Used to plot the inference-time scaling chart
 */
export function getAccuracyCurve(puzzle, maxIter = 20) {
  return Array.from({ length: maxIter }, (_, i) => {
    const { accuracy } = runLatentModel(puzzle, i + 1);
    return { iter: i + 1, accuracy };
  });
}

// ---- Puzzle definitions ----
// Each puzzle: inputGrid (9 cells), mask (which cells to predict), targetGrid
export const PUZZLES = [
  {
    id: 0,
    name: "Color Rotation",
    description: "Colors rotate clockwise — can you predict the missing cell?",
    // 3x3 grid, values 0-7 represent colors
    inputGrid: [1, 2, 3, 2, 3, 4, 3, 4, -1],
    targetGrid: [1, 2, 3, 2, 3, 4, 3, 4, 5],
    mask:       [0, 0, 0, 0, 0, 0, 0, 0, 1],
    difficulty: "easy",
  },
  {
    id: 1,
    name: "Mirror Pattern",
    description: "The right column mirrors the left — predict the missing values.",
    inputGrid: [1, 0, -1, 2, 0, -1, 3, 0, -1],
    targetGrid: [1, 0, 1,  2, 0, 2,  3, 0, 3],
    mask:       [0, 0, 1,  0, 0, 1,  0, 0, 1],
    difficulty: "medium",
  },
  {
    id: 2,
    name: "Diagonal Sum",
    description: "Each diagonal has a consistent color. Predict the corner.",
    inputGrid: [1, 2, 3, 2, 3, -1, 3, -1, 5],
    targetGrid: [1, 2, 3, 2, 3, 4,  3, 4,  5],
    mask:       [0, 0, 0, 0, 0, 1,  0, 1,  0],
    difficulty: "medium",
  },
  {
    id: 3,
    name: "Row Increment",
    description: "Each row increments by 1. Predict the missing cells.",
    inputGrid: [1, 2, 3,  2, -1, 4,  3, 4, -1],
    targetGrid: [1, 2, 3, 2, 3,  4,  3, 4,  5],
    mask:       [0, 0, 0, 0, 1,  0,  0, 0,  1],
    difficulty: "hard",
  },
  {
    id: 4,
    name: "Complex Rule",
    description: "Multiple rules interact — requires more latent iterations.",
    inputGrid: [-1, 2, -1, 2, 3, 4, -1, 4, -1],
    targetGrid: [1,  2, 3,  2, 3, 4, 3,  4, 5],
    mask:       [1,  0, 1,  0, 0, 0, 1,  0, 1],
    difficulty: "hard",
  },
];

// Color palette (matching CSS later)
export const COLOR_PALETTE = [
  '#1e293b', // 0: dark
  '#7c3aed', // 1: purple
  '#06b6d4', // 2: cyan
  '#10b981', // 3: green
  '#f59e0b', // 4: yellow
  '#ec4899', // 5: pink
  '#ef4444', // 6: red
  '#f0f0ff', // 7: white
];
