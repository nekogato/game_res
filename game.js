const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const ui = {
  phase: document.getElementById("phaseLabel"),
  clock: document.getElementById("clock"),
  cash: document.getElementById("cash"),
  served: document.getElementById("served"),
  satisfaction: document.getElementById("satisfaction"),
  popups: document.getElementById("customerPopups"),
  menu: document.getElementById("menuPanel"),
  menuButton: document.getElementById("menuBtn"),
  menuClose: document.getElementById("menuCloseBtn"),
  menuConfirm: document.getElementById("menuConfirmBtn"),
  menuRows: document.getElementById("menuRows"),
  tablePurchasePopup: document.getElementById("tablePurchasePopup"),
  tablePurchaseBody: document.getElementById("tablePurchaseBody"),
  tablePurchaseQty: document.getElementById("tablePurchaseQty"),
  tablePurchaseConfirm: document.getElementById("tablePurchaseConfirmBtn"),
  tablePurchaseCancel: document.getElementById("tablePurchaseCancelBtn"),
  unlockPopup: document.getElementById("unlockPopup"),
  unlockList: document.getElementById("unlockList"),
  unlockClose: document.getElementById("unlockCloseBtn"),
  recruit: document.getElementById("recruitPanel"),
  recruitButton: document.getElementById("recruitBtn"),
  recruitClose: document.getElementById("recruitCloseBtn"),
  hiredRows: document.getElementById("hiredRows"),
  candidateRows: document.getElementById("candidateRows"),
  settlement: document.getElementById("settlementPopup"),
  settlementBody: document.getElementById("settlementBody"),
  resultPopup: document.getElementById("resultPopup"),
  resultTitle: document.getElementById("resultTitle"),
  resultBody: document.getElementById("resultBody"),
  resultContinue: document.getElementById("resultContinueBtn"),
  restart: document.getElementById("restartBtn"),
  toast: document.getElementById("toast"),
  toolbox: document.querySelector(".toolbox"),
  open: document.getElementById("openBtn"),
  continue: document.getElementById("continueBtn"),
  addTable: document.getElementById("addTableBtn"),
  deleteTable: document.getElementById("deleteTableBtn"),
  pause: document.getElementById("pauseBtn"),
  speed: document.getElementById("speedBtn"),
  reset: document.getElementById("resetBtn"),
};

const W = canvas.width;
const H = canvas.height;
const interior = { x: 70, y: 92, w: 1140, h: 436 };
const baseCellW = interior.w / 30;
const grid = { cols: 24, rows: 12, x: interior.x + baseCellW * 3, y: interior.y, w: baseCellW, h: interior.h / 12 };
const streetY = 642;
const INGREDIENT_COST = 12;
const DEBUG_VERSION = "v69";
const SEATED_Y_OFFSET = -25;
const WEEKLY_RENT = 5000;
const VICTORY_CASH = 300000;
const TABLE_COST = 250;
const SHOW_DEBUG = false;
const QUEUE_PER_ROW = 8;
const QUEUE_ROWS = 2;
const QUEUE_LIMIT = QUEUE_PER_ROW * QUEUE_ROWS;
const NEED_LIMITS = {
  waiting: 34,
  food: 48,
  checkout: 36
};
const CHECKOUT_WALKOUT_CHANCE = 0.45;
const TASTE_WALKOUT_CHANCE = 0.4;
const TOILET_DIRTY_THRESHOLD = 45;
const TOILET_CLEAN_TIME = 8;
const SATISFACTION_DELTA = {
  satisfied: 5,
  waiting: -0.5,
  food: -3,
  checkout: -2,
  toilet: -1,
  soldout: -2,
  taste: -2
};
const LUNCH_PEAK = { start: 12 * 60, end: 14 * 60 };
const DINNER_PEAK = { start: 18 * 60, end: 20 * 60 };
const FOOD_ITEMS = {
  toast: { name: "牛油多士", baseCost: 14, tasteBase: 18, tasteGain: 4.8, tasteCurve: 1.45, cookTime: 3, unlockAt: 0, stock: 0 },
  omelette: { name: "芝士奄列", baseCost: 28, tasteBase: 30, tasteGain: 3.6, tasteCurve: 1.18, cookTime: 5, unlockAt: 0, stock: 0 },
  steak: { name: "香煎牛扒", baseCost: 96, tasteBase: 58, tasteGain: 1.9, tasteCurve: 0.78, cookTime: 10, unlockAt: 0, stock: 0 },
  soup: { name: "忌廉蘑菇湯", baseCost: 20, tasteBase: 24, tasteGain: 4.3, tasteCurve: 1.3, cookTime: 4, unlockAt: 8, stock: 0 },
  pasta: { name: "番茄肉醬意粉", baseCost: 42, tasteBase: 36, tasteGain: 3.1, tasteCurve: 1.05, cookTime: 7, unlockAt: 18, stock: 0 },
  curry: { name: "日式咖喱飯", baseCost: 34, tasteBase: 34, tasteGain: 3.9, tasteCurve: 1.22, cookTime: 6, unlockAt: 30, stock: 0 },
  salad: { name: "田園沙律", baseCost: 26, tasteBase: 28, tasteGain: 2.8, tasteCurve: 0.95, cookTime: 3, unlockAt: 45, stock: 0 },
  burger: { name: "厚切漢堡", baseCost: 54, tasteBase: 42, tasteGain: 3.4, tasteCurve: 1.1, cookTime: 8, unlockAt: 62, stock: 0 },
  risotto: { name: "野菌燴飯", baseCost: 68, tasteBase: 46, tasteGain: 2.7, tasteCurve: 0.9, cookTime: 9, unlockAt: 82, stock: 0 },
  ribs: { name: "蜜糖燒肋骨", baseCost: 88, tasteBase: 55, tasteGain: 2.4, tasteCurve: 0.82, cookTime: 11, unlockAt: 105, stock: 0 },
  seafoodPasta: { name: "海鮮忌廉意粉", baseCost: 116, tasteBase: 62, tasteGain: 2.2, tasteCurve: 0.8, cookTime: 10, unlockAt: 132, stock: 0 },
  duck: { name: "橙香鴨胸", baseCost: 138, tasteBase: 66, tasteGain: 2.0, tasteCurve: 0.74, cookTime: 12, unlockAt: 162, stock: 0 },
  lobster: { name: "龍蝦濃湯", baseCost: 172, tasteBase: 72, tasteGain: 1.7, tasteCurve: 0.66, cookTime: 9, unlockAt: 195, stock: 0 },
  wagyuRice: { name: "和牛蒜香飯", baseCost: 206, tasteBase: 76, tasteGain: 1.55, tasteCurve: 0.62, cookTime: 13, unlockAt: 232, stock: 0 },
  truffleChicken: { name: "黑松露烤雞", baseCost: 236, tasteBase: 80, tasteGain: 1.42, tasteCurve: 0.58, cookTime: 14, unlockAt: 272, stock: 0 },
  lamb: { name: "香草羊架", baseCost: 268, tasteBase: 83, tasteGain: 1.35, tasteCurve: 0.55, cookTime: 15, unlockAt: 315, stock: 0 },
  foieGras: { name: "香煎鵝肝", baseCost: 312, tasteBase: 87, tasteGain: 1.18, tasteCurve: 0.48, cookTime: 8, unlockAt: 362, stock: 0 },
  kingCrab: { name: "帝王蟹焗飯", baseCost: 356, tasteBase: 90, tasteGain: 1.05, tasteCurve: 0.45, cookTime: 16, unlockAt: 412, stock: 0 },
  tastingMenu: { name: "主廚套餐", baseCost: 420, tasteBase: 93, tasteGain: 0.95, tasteCurve: 0.42, cookTime: 18, unlockAt: 468, stock: 0 },
  caviarSteak: { name: "魚子醬牛扒", baseCost: 520, tasteBase: 96, tasteGain: 0.82, tasteCurve: 0.38, cookTime: 17, unlockAt: 530, stock: 0 }
};
const CUSTOMER_TIERS = {
  low: { label: "低級", wait: 1.35, toiletUse: 0.16, toiletDirt: 8, dirtyAnger: 0.18, tasteNeed: 42, priceWeights: { low: 0.62, mid: 0.32, high: 0.06 } },
  mid: { label: "中級", wait: 1, toiletUse: 0.22, toiletDirt: 12, dirtyAnger: 0.32, tasteNeed: 62, priceWeights: { low: 0.3, mid: 0.42, high: 0.28 } },
  high: { label: "高級", wait: 0.68, toiletUse: 0.3, toiletDirt: 18, dirtyAnger: 0.52, tasteNeed: 82, priceWeights: { low: 0.08, mid: 0.36, high: 0.56 } }
};
const STAFF_CANDIDATES = [
  { id: "mei", name: "阿美", salary: 52, base: { charm: 4, patience: 4 }, skills: { serve: 2, seat: 2, checkout: 1, toilet: 1 } },
  { id: "kin", name: "阿健", salary: 48, base: { charm: 2, patience: 5 }, skills: { serve: 1, seat: 2, checkout: 2, toilet: 1 } },
  { id: "yan", name: "小欣", salary: 64, base: { charm: 5, patience: 3 }, skills: { serve: 3, seat: 2, checkout: 1, toilet: 1 } },
  { id: "lok", name: "樂仔", salary: 44, base: { charm: 3, patience: 3 }, skills: { serve: 1, seat: 1, checkout: 1, toilet: 2 } },
  { id: "fai", name: "輝哥", salary: 72, base: { charm: 2, patience: 5 }, skills: { serve: 3, seat: 1, checkout: 3, toilet: 1 } },
  { id: "ling", name: "阿玲", salary: 58, base: { charm: 5, patience: 2 }, skills: { serve: 2, seat: 3, checkout: 1, toilet: 1 } },
  { id: "ho", name: "浩然", salary: 50, base: { charm: 3, patience: 4 }, skills: { serve: 2, seat: 1, checkout: 2, toilet: 1 } },
  { id: "sum", name: "心怡", salary: 68, base: { charm: 4, patience: 4 }, skills: { serve: 2, seat: 3, checkout: 2, toilet: 1 } },
  { id: "ming", name: "明叔", salary: 60, base: { charm: 2, patience: 6 }, skills: { serve: 1, seat: 1, checkout: 3, toilet: 3 } },
  { id: "tung", name: "東東", salary: 82, base: { charm: 5, patience: 4 }, skills: { serve: 4, seat: 2, checkout: 2, toilet: 1 } }
];

const objectConfig = {
  table: { cols: 1, rows: 1, drawW: 56, drawH: 50, blocks: true, label: "餐桌" },
  kitchen: { cols: 6, rows: 5, drawW: 218, drawH: 177, blocks: true, label: "廚房", single: true },
  toilet: { cols: 3, rows: 3, drawW: 112, drawH: 120, blocks: true, label: "廁所", single: true }
};

const atlasRegions = {
  table: [[38, 58, 270, 234], [387, 45, 260, 237], [710, 52, 252, 232], [1056, 52, 257, 234]],
  kitchen: [[57, 346, 354, 201], [482, 365, 329, 175]],
  customer: [[420, 590, 90, 156], [553, 589, 94, 156], [670, 588, 104, 157], [818, 589, 99, 156]],
  waiter: [[980, 585, 92, 162], [1113, 586, 93, 161], [1245, 588, 92, 158], [1377, 586, 94, 160]],
  food: [[54, 760, 148, 96], [225, 760, 148, 96], [400, 760, 139, 96], [585, 761, 110, 97], [717, 761, 123, 93]],
  dirty: [[58, 889, 147, 77], [237, 887, 151, 78], [414, 887, 143, 80], [597, 884, 128, 82]],
  coin: [[1002, 760, 93, 93], [1132, 759, 93, 94], [1254, 759, 94, 95]],
  toilet: [[0, 0, 1, 1]]
};

const spriteCounts = {
  table: 4,
  kitchen: 2,
  customer: 4,
  waiter: 4,
  food: 5,
  dirty: 4,
  toilet: 1
};

let assets = { map: null, atlas: null, sprites: {}, tableSingle: null, waiterWalk: null, customerWalks: [], customerSit: null, customerFemaleSit: null };
let last = performance.now();
let selectedObject = null;
let pointerDrag = null;
let speed = 1;
let paused = false;
let debugInfo = { frames: 0, lastError: "", lastPlaced: "" };
const customerPopups = new Map();
const staffPopups = new Map();
let kitchenPopup = null;
let pendingTableSpots = [];

const state = {
  day: 1,
  mode: "setup",
  time: 10 * 60,
  cash: 10000,
  gross: 0,
  totalGross: 0,
  ingredientCost: 0,
  satisfaction: 50,
  served: 0,
  totalServed: 0,
  negativeCashDays: 0,
  victoryShown: false,
  gameOver: false,
  lost: 0,
  walkouts: 0,
  wastedFood: 0,
  dayEnded: false,
  tables: [],
  kitchens: [],
  stations: [],
  toilets: [],
  waiters: [],
  staffRoster: [],
  staffCandidates: [],
  visibleCandidateIds: [],
  customers: [],
  passers: [],
  tasks: [],
  spawnTick: 0,
  messageTimer: 0,
  settlement: null,
  menu: {},
  unlockedFoods: []
};

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function createMenuDefaults() {
  const menu = {};
  for (const [keyName, item] of Object.entries(FOOD_ITEMS)) {
    if (item.unlockAt > state.totalServed) continue;
    menu[keyName] = createMenuItem(keyName, item.baseCost, item.stock);
  }
  return menu;
}

function unlockedFoodKeys() {
  return Object.entries(FOOD_ITEMS)
    .filter(([, item]) => item.unlockAt <= state.totalServed)
    .map(([keyName]) => keyName);
}

function createMenuForNewDay() {
  const defaults = createMenuDefaults();
  for (const keyName of Object.keys(defaults)) {
    const previous = state.menu[keyName];
    if (!previous) continue;
    defaults[keyName].cost = previous.cost;
    defaults[keyName].price = previous.cost * 2;
    defaults[keyName].taste = tasteForCost(keyName, previous.cost);
    defaults[keyName].stock = previous.plannedStock ?? previous.stock ?? 0;
    defaults[keyName].plannedStock = previous.plannedStock ?? previous.stock ?? 0;
    defaults[keyName].todayOrders = 0;
    defaults[keyName].todayRating = 0;
    defaults[keyName].totalOrders = previous.totalOrders || 0;
    defaults[keyName].totalRating = previous.totalRating || 0;
    defaults[keyName].offeredToday = false;
  }
  return defaults;
}

function tasteForCost(keyName, cost) {
  const item = FOOD_ITEMS[keyName];
  if (!item) return 0;
  const extra = Math.max(0, cost - item.baseCost);
  return Math.round(Math.min(100, item.tasteBase + item.tasteGain * Math.pow(extra, item.tasteCurve)));
}

function maxCostForFood(item) {
  return Math.max(item.baseCost + 30, Math.ceil(item.baseCost * 2.4));
}

function createMenuItem(keyName, cost, stock) {
  const item = FOOD_ITEMS[keyName];
  return {
    key: keyName,
    name: item.name,
    cost,
    price: cost * 2,
    stock,
    plannedStock: stock,
    taste: tasteForCost(keyName, cost),
    cookTime: item.cookTime,
    offeredToday: false,
    todayOrders: 0,
    totalOrders: 0,
    todayRating: 0,
    totalRating: 0
  };
}

function cookSpeedLabel(cookTime) {
  if (cookTime <= 5) return "快";
  if (cookTime <= 10) return "中";
  return "慢";
}

function renderMenuRows() {
  ui.menuRows.innerHTML = "";
  for (const [keyName, food] of Object.entries(state.menu)) {
    const config = FOOD_ITEMS[keyName];
    if (!config) continue;
    const row = document.createElement("div");
    row.className = "menu-grid menu-row";
    row.dataset.food = keyName;
    row.innerHTML = `
      <span>${food.name}</span>
      <label class="menu-cost">
        <input data-field="cost" type="range" min="${config.baseCost}" max="${maxCostForFood(config)}" step="1" value="${food.cost}">
        <span data-field="costValue">$${food.cost}</span>
      </label>
      <span class="menu-price" data-field="price">$${food.price}</span>
      <input data-field="stock" type="number" min="0" step="1" value="${food.stock}">
      <span class="menu-cook" data-field="cook">${cookSpeedLabel(food.cookTime || config.cookTime || 6)}</span>
      <span class="menu-rating" data-field="rating">${food.totalRating || 0}</span>
    `;
    ui.menuRows.appendChild(row);
  }
}

function fillMenuInputs() {
  renderMenuRows();
  for (const row of ui.menu.querySelectorAll(".menu-row")) {
    const food = state.menu[row.dataset.food];
    if (!food) continue;
    row.querySelector('[data-field="cost"]').value = food.cost;
    row.querySelector('[data-field="costValue"]').textContent = `$${food.cost}`;
    row.querySelector('[data-field="price"]').textContent = `$${food.price}`;
    row.querySelector('[data-field="stock"]').value = food.stock;
    row.querySelector('[data-field="cook"]').textContent = cookSpeedLabel(food.cookTime || FOOD_ITEMS[row.dataset.food]?.cookTime || 6);
    row.querySelector('[data-field="rating"]').textContent = food.totalRating || 0;
  }
}

function syncMenuFromInputs() {
  for (const row of ui.menu.querySelectorAll(".menu-row")) {
    const keyName = row.dataset.food;
    const config = FOOD_ITEMS[keyName];
    if (!config) continue;
    const current = state.menu[keyName] || createMenuItem(keyName, config.baseCost, config.stock);
    const cost = Math.max(config.baseCost, Number(row.querySelector('[data-field="cost"]').value) || current.cost);
    state.menu[keyName] = {
      ...current,
      cost,
      price: cost * 2,
      taste: tasteForCost(keyName, cost),
      stock: Math.max(0, Math.floor(Number(row.querySelector('[data-field="stock"]').value) || 0)),
      plannedStock: Math.max(0, Math.floor(Number(row.querySelector('[data-field="stock"]').value) || 0)),
      totalOrders: current.totalOrders || 0,
      totalRating: current.totalRating || 0,
      todayOrders: current.todayOrders || 0,
      todayRating: current.todayRating || 0,
      offeredToday: current.offeredToday || false
    };
  }
  fillMenuInputs();
}

function isMenuSoldOut() {
  return Object.values(state.menu).length > 0 && Object.values(state.menu).every(food => food.stock <= 0);
}

function availableMenuStock() {
  return Object.values(state.menu).reduce((sum, food) => sum + food.stock, 0);
}

function calculateMenuCost() {
  return Object.values(state.menu).reduce((sum, food) => sum + food.cost * food.stock, 0);
}

function spendCash(amount) {
  state.cash = Math.round((state.cash - amount) * 10) / 10;
}

function receiveCash(amount) {
  state.cash = Math.round((state.cash + amount) * 10) / 10;
  maybeShowVictory();
}

function maybeShowVictory() {
  if (state.victoryShown || state.gameOver || state.cash < VICTORY_CASH) return;
  state.victoryShown = true;
  showResultPopup("勝利", `餐廳現金已超過 $${VICTORY_CASH}！你已經把晨光西餐廳經營成城中名店。`, "victory");
}

function showResultPopup(title, body, mode) {
  ui.resultTitle.textContent = title;
  ui.resultBody.textContent = body;
  ui.resultContinue.hidden = mode !== "victory";
  ui.restart.hidden = mode !== "gameover";
  ui.resultPopup.hidden = false;
}

function hideResultPopup() {
  ui.resultPopup.hidden = true;
}

function showTablePurchasePopup(spots) {
  pendingTableSpots = spots;
  const affordable = Math.floor(state.cash / TABLE_COST);
  const maxQty = Math.max(0, Math.min(spots.length, affordable));
  ui.tablePurchaseBody.textContent = `每張新餐桌需要 $${TABLE_COST}。現金：$${state.cash}。目前最多可放 ${spots.length} 張，可購買 ${maxQty} 張。`;
  ui.tablePurchaseQty.max = String(maxQty);
  ui.tablePurchaseQty.value = "1";
  ui.tablePurchaseConfirm.disabled = maxQty <= 0;
  ui.tablePurchasePopup.hidden = false;
}

function hideTablePurchasePopup() {
  pendingTableSpots = [];
  ui.tablePurchasePopup.hidden = true;
}

function menuLeftovers() {
  return Object.values(state.menu).map(food => ({
    name: food.name,
    stock: food.stock,
    cost: food.cost,
    value: food.cost * food.stock
  }));
}

function showUnlockPopup(items) {
  if (!items.length) return;
  ui.unlockList.innerHTML = items
    .map(item => `<div class="unlock-item">${item.name}</div>`)
    .join("");
  ui.unlockPopup.hidden = false;
}

function checkFoodUnlocks() {
  const newlyUnlocked = [];
  for (const keyName of unlockedFoodKeys()) {
    if (state.unlockedFoods.includes(keyName)) continue;
    state.unlockedFoods.push(keyName);
    newlyUnlocked.push(FOOD_ITEMS[keyName]);
  }
  showUnlockPopup(newlyUnlocked);
}

function chromaKey(img) {
  const off = document.createElement("canvas");
  off.width = img.width;
  off.height = img.height;
  const ox = off.getContext("2d");
  ox.drawImage(img, 0, 0);
  const data = ox.getImageData(0, 0, off.width, off.height);
  for (let i = 0; i < data.data.length; i += 4) {
    const r = data.data[i];
    const g = data.data[i + 1];
    const b = data.data[i + 2];
    if (r > 210 && g < 70 && b > 190) data.data[i + 3] = 0;
  }
  ox.putImageData(data, 0, 0);
  return off;
}

function placedGroups() {
  return [["table", state.tables], ["kitchen", state.kitchens], ["toilet", state.toilets]];
}

function allPlacedObjects() {
  return placedGroups().flatMap(([, items]) => items);
}

function cellCenter(cell) {
  return { x: grid.x + (cell.x + 0.5) * grid.w, y: grid.y + (cell.y + 0.5) * grid.h };
}

function pixelToCell(x, y) {
  return {
    x: Math.floor((x - grid.x) / grid.w),
    y: Math.floor((y - grid.y) / grid.h)
  };
}

function pixelToCenteredCell(item, x, y) {
  return {
    x: Math.floor((x - grid.x) / grid.w - item.cols / 2),
    y: Math.floor((y - grid.y) / grid.h - item.rows / 2)
  };
}

function clampCell(item, cell) {
  return {
    x: Math.max(0, Math.min(grid.cols - item.cols, cell.x)),
    y: Math.max(0, Math.min(grid.rows - item.rows, cell.y))
  };
}

function objectCenter(item) {
  return cellCenter({ x: item.gridX + item.cols / 2 - 0.5, y: item.gridY + item.rows / 2 - 0.5 });
}

function syncObjectPixels(item) {
  const center = objectCenter(item);
  item.x = center.x;
  item.y = center.y;
}

function makePlaced(type, gridX, gridY, variant = 0) {
  const cfg = objectConfig[type];
  const randomId = globalThis.crypto?.randomUUID ? globalThis.crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
  const item = {
    id: `${type}-${randomId}`,
    type,
    gridX,
    gridY,
    cols: cfg.cols,
    rows: cfg.rows,
    w: cfg.drawW,
    h: cfg.drawH,
    variant,
    isOccupied: false,
    occupiedBy: null,
    dirty: false,
    order: null,
    cleanliness: type === "toilet" ? 100 : null,
    cleaning: false,
    cleanProgress: 0,
    position: { x: gridX, y: gridY }
  };
  const clamped = clampCell(item, { x: gridX, y: gridY });
  item.gridX = clamped.x;
  item.gridY = clamped.y;
  item.position = { x: item.gridX, y: item.gridY };
  syncObjectPixels(item);
  return item;
}

function makeStaffStart(staff, gridX, gridY) {
  staff.type = "staffStart";
  staff.cols = 1;
  staff.rows = 1;
  staff.w = 46;
  staff.h = 81;
  staff.gridX = gridX;
  staff.gridY = gridY;
  staff.position = { x: gridX, y: gridY };
  syncObjectPixels(staff);
}

function staffStartCell(staff) {
  return { x: staff.gridX, y: staff.gridY };
}

function isStaffStart(item) {
  return item?.type === "staffStart";
}

function findStaffStartCell(index = 0) {
  const blocked = buildBlockedGrid();
  const used = new Set(hiredStaff().filter(staff => Number.isFinite(staff.gridX)).map(staff => key(staffStartCell(staff))));
  const preferred = { x: 2 + (index % 8) * 2, y: 10 - Math.floor(index / 8) * 2 };
  const candidates = [preferred];
  for (let y = grid.rows - 1; y >= 0; y -= 1) {
    for (let x = 0; x < grid.cols; x += 1) candidates.push({ x, y });
  }
  return candidates.find(cell => isCellOpen(cell, blocked) && !used.has(key(cell))) || { x: 0, y: grid.rows - 1 };
}

function ensureStaffStartPositions() {
  hiredStaff().forEach((staff, index) => {
    const blocked = buildBlockedGrid();
    const cell = Number.isFinite(staff.gridX) ? staffStartCell(staff) : null;
    const duplicate = hiredStaff().some((other, otherIndex) => otherIndex < index && other.gridX === staff.gridX && other.gridY === staff.gridY);
    if (!cell || !isCellOpen(cell, blocked) || duplicate) {
      const next = findStaffStartCell(index);
      makeStaffStart(staff, next.x, next.y);
    } else {
      makeStaffStart(staff, cell.x, cell.y);
    }
  });
}

function defaultSetup() {
  state.kitchens.push(makePlaced("kitchen", 4, 4, 0));
  state.tables.push(makePlaced("table", 12, 7, 0));
  state.tables.push(makePlaced("table", 15, 5, 1));
  state.tables.push(makePlaced("table", 18, 7, 2));
  state.toilets.push(makePlaced("toilet", 21, 1, 0));
}

function makeSkillSet(levels) {
  return {
    serve: { label: "送餐", level: levels.serve, xp: 0 },
    seat: { label: "帶位", level: levels.seat, xp: 0 },
    checkout: { label: "結帳", level: levels.checkout, xp: 0 },
    toilet: { label: "洗廁所", level: levels.toilet, xp: 0 }
  };
}

function createStaffFromCandidate(candidate, index) {
  return {
    id: candidate.id,
    name: candidate.name,
    salary: candidate.salary,
    base: { ...candidate.base },
    skills: makeSkillSet(candidate.skills),
    happiness: 76 + Math.floor(Math.random() * 12),
    actions: 0,
    otSeconds: 0,
    variant: index % atlasRegions.waiter.length
  };
}

function setupStaffCandidates() {
  state.staffCandidates = STAFF_CANDIDATES.map((candidate, index) => createStaffFromCandidate(candidate, index));
  state.staffRoster = [state.staffCandidates[0]];
  refreshRecruitAvailability(true);
}

function refreshRecruitAvailability(force = false) {
  const pool = state.staffCandidates.filter(candidate => !state.staffRoster.includes(candidate));
  if (!force && !pool.length) {
    state.visibleCandidateIds = [];
    return;
  }
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  state.visibleCandidateIds = shuffled.slice(0, Math.min(4, shuffled.length)).map(candidate => candidate.id);
}

function hiredStaff() {
  return state.staffRoster;
}

function staffSummary(staff) {
  const s = staff.skills;
  return `薪金 $${staff.salary} · 送餐 ${s.serve.level} / 帶位 ${s.seat.level} / 結帳 ${s.checkout.level} / 洗廁所 ${s.toilet.level} · 魅力 ${staff.base.charm} / 耐性 ${staff.base.patience}`;
}

function renderRecruitPanel() {
  ui.hiredRows.innerHTML = hiredStaff().map(staff => `
    <div class="staff-row">
      <div>
        <div class="staff-name">${staff.name}</div>
        <div class="staff-meta">${staffSummary(staff)}</div>
      </div>
      <button data-action="fire" data-id="${staff.id}" type="button">解雇</button>
    </div>
  `).join("") || `<div class="staff-row"><div class="staff-meta">未聘請侍應</div></div>`;

  const candidates = state.visibleCandidateIds
    .map(id => state.staffCandidates.find(candidate => candidate.id === id))
    .filter(Boolean);
  ui.candidateRows.innerHTML = candidates.map(staff => `
    <div class="staff-row">
      <div>
        <div class="staff-name">${staff.name}</div>
        <div class="staff-meta">${staffSummary(staff)}</div>
      </div>
      <button data-action="hire" data-id="${staff.id}" type="button">聘請</button>
    </div>
  `).join("") || `<div class="staff-row"><div class="staff-meta">暫時沒有新求職者</div></div>`;
}

function hireStaff(id) {
  if (state.mode !== "setup") return;
  const staff = state.staffCandidates.find(candidate => candidate.id === id);
  if (!staff || state.staffRoster.includes(staff)) return;
  state.staffRoster.push(staff);
  ensureStaffStartPositions();
  state.visibleCandidateIds = state.visibleCandidateIds.filter(candidateId => candidateId !== id);
  renderRecruitPanel();
  flash(`已聘請 ${staff.name}。可直接拖動地圖上的侍應改變初始位置。`);
}

function fireStaff(id) {
  if (state.mode !== "setup") return;
  const staff = state.staffRoster.find(candidate => candidate.id === id);
  if (!staff) return;
  state.staffRoster = state.staffRoster.filter(candidate => candidate.id !== id);
  if (selectedObject === staff) selectedObject = null;
  ensureStaffStartPositions();
  renderRecruitPanel();
  flash(`已解雇 ${staff.name}。`);
}

function resetGame() {
  state.day = 1;
  state.mode = "setup";
  state.time = 10 * 60;
  state.cash = 10000;
  state.gross = 0;
  state.totalGross = 0;
  state.ingredientCost = 0;
  state.satisfaction = 50;
  state.served = 0;
  state.totalServed = 0;
  state.negativeCashDays = 0;
  state.victoryShown = false;
  state.gameOver = false;
  state.lost = 0;
  state.walkouts = 0;
  state.wastedFood = 0;
  state.dayEnded = false;
  state.settlement = null;
  paused = false;
  for (const [, group] of placedGroups()) group.length = 0;
  state.stations.length = 0;
  state.waiters.length = 0;
  state.customers.length = 0;
  state.passers.length = 0;
  state.tasks.length = 0;
  setupStaffCandidates();
  state.unlockedFoods = unlockedFoodKeys();
  state.menu = createMenuDefaults();
  ui.unlockPopup.hidden = true;
  ui.resultPopup.hidden = true;
  ui.tablePurchasePopup.hidden = true;
  ui.menu.hidden = true;
  ui.recruit.hidden = true;
  ui.settlement.hidden = true;
  selectedObject = null;
  pointerDrag = null;
  pendingTableSpots = [];
  defaultSetup();
  ensureStaffStartPositions();
  fillMenuInputs();
  renderRecruitPanel();
  ui.pause.textContent = "暫停";
  flash("物件會吸附到網格。餐桌、廚房和廁所都需要先設置；門口固定在網格下方中間。");
}

function startNextDay() {
  if (state.gameOver) return;
  paused = false;
  ui.pause.textContent = "暫停";
  state.day += 1;
  state.mode = "setup";
  state.time = 10 * 60;
  state.gross = 0;
  state.ingredientCost = 0;
  state.served = 0;
  state.lost = 0;
  state.walkouts = 0;
  state.wastedFood = 0;
  state.dayEnded = false;
  state.settlement = null;
  state.waiters.length = 0;
  state.customers.length = 0;
  state.passers.length = 0;
  state.tasks.length = 0;
  refreshRecruitAvailability(true);
  state.menu = createMenuForNewDay();
  for (const table of state.tables) {
    table.isOccupied = false;
    table.occupiedBy = null;
    table.dirty = false;
    table.order = null;
  }
  for (const toilet of state.toilets) {
    toilet.cleaning = false;
    toilet.cleaningAssigned = false;
    toilet.cleanProgress = 0;
  }
  selectedObject = null;
  pointerDrag = null;
  ui.menu.hidden = true;
  ui.recruit.hidden = true;
  ui.settlement.hidden = true;
  ensureStaffStartPositions();
  fillMenuInputs();
  renderRecruitPanel();
  flash(`第 ${state.day} 天早上，可以重新設置設施、員工位置和今日菜單。`);
}

function buildBlockedGrid(ignoreItem = null) {
  const blocked = Array.from({ length: grid.rows }, () => Array(grid.cols).fill(false));
  for (const item of allPlacedObjects()) {
    if (item === ignoreItem || !objectConfig[item.type].blocks) continue;
    for (let y = item.gridY; y < item.gridY + item.rows; y += 1) {
      for (let x = item.gridX; x < item.gridX + item.cols; x += 1) {
        if (x >= 0 && x < grid.cols && y >= 0 && y < grid.rows) blocked[y][x] = true;
      }
    }
  }
  return blocked;
}

function isCellOpen(cell, blocked = buildBlockedGrid()) {
  return cell.x >= 0 && cell.x < grid.cols && cell.y >= 0 && cell.y < grid.rows && !blocked[cell.y][cell.x];
}

function neighbors(cell, blocked) {
  return [
    { x: cell.x + 1, y: cell.y },
    { x: cell.x - 1, y: cell.y },
    { x: cell.x, y: cell.y + 1 },
    { x: cell.x, y: cell.y - 1 }
  ].filter(next => isCellOpen(next, blocked));
}

function key(cell) {
  return `${cell.x},${cell.y}`;
}

function heuristic(a, b) {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

// A* pathfinding: f(n) = g(n) + h(n), with Manhattan distance as h(n).
function aStar(start, goal, blocked = buildBlockedGrid()) {
  if (!isCellOpen(start, blocked) || !isCellOpen(goal, blocked)) return null;
  const open = [start];
  const cameFrom = new Map();
  const gScore = new Map([[key(start), 0]]);
  const fScore = new Map([[key(start), heuristic(start, goal)]]);
  const closed = new Set();

  while (open.length) {
    open.sort((a, b) => (fScore.get(key(a)) ?? Infinity) - (fScore.get(key(b)) ?? Infinity));
    const current = open.shift();
    const currentKey = key(current);
    if (current.x === goal.x && current.y === goal.y) {
      const path = [current];
      let cursor = currentKey;
      while (cameFrom.has(cursor)) {
        const prev = cameFrom.get(cursor);
        path.unshift(prev.cell);
        cursor = prev.key;
      }
      return path;
    }
    closed.add(currentKey);
    for (const next of neighbors(current, blocked)) {
      const nextKey = key(next);
      if (closed.has(nextKey)) continue;
      const tentative = (gScore.get(currentKey) ?? Infinity) + 1;
      if (tentative >= (gScore.get(nextKey) ?? Infinity)) continue;
      cameFrom.set(nextKey, { cell: current, key: currentKey });
      gScore.set(nextKey, tentative);
      fScore.set(nextKey, tentative + heuristic(next, goal));
      if (!open.some(cell => cell.x === next.x && cell.y === next.y)) open.push(next);
    }
  }
  return null;
}

function adjacentServiceCells(item, blocked = buildBlockedGrid()) {
  const cells = [];
  for (let x = item.gridX; x < item.gridX + item.cols; x += 1) {
    cells.push({ x, y: item.gridY - 1 }, { x, y: item.gridY + item.rows });
  }
  for (let y = item.gridY; y < item.gridY + item.rows; y += 1) {
    cells.push({ x: item.gridX - 1, y }, { x: item.gridX + item.cols, y });
  }
  return cells.filter((cell, index, arr) => isCellOpen(cell, blocked) && arr.findIndex(other => key(other) === key(cell)) === index);
}

function nearestServiceCell(from, item, blocked = buildBlockedGrid()) {
  let best = null;
  for (const cell of adjacentServiceCells(item, blocked)) {
    const path = aStar(from, cell, blocked);
    if (path && (!best || path.length < best.path.length)) best = { cell, path };
  }
  return best;
}

function kitchenServiceCell(kitchen, blocked = buildBlockedGrid()) {
  if (!kitchen) return null;
  const cell = {
    x: Math.floor(kitchen.gridX + (kitchen.cols - 1) / 2),
    y: kitchen.gridY + kitchen.rows
  };
  return isCellOpen(cell, blocked) ? cell : null;
}

function nearestKitchenServiceCell(from, kitchen, blocked = buildBlockedGrid()) {
  const cell = kitchenServiceCell(kitchen, blocked);
  if (!cell) return null;
  const path = aStar(from, cell, blocked);
  return path ? { cell, path } : null;
}

function doorCell() {
  const blocked = buildBlockedGrid();
  const fixed = { x: Math.floor(grid.cols / 2), y: grid.rows - 1 };
  return isCellOpen(fixed, blocked) ? fixed : null;
}

function doorPixels() {
  return cellCenter({ x: Math.floor(grid.cols / 2), y: grid.rows - 1 });
}

function tableSeatCell(table) {
  const entrance = doorCell() || { x: table.gridX, y: table.gridY };
  return nearestServiceCell(entrance, table)?.cell || null;
}

function seatedPixels(seat) {
  const pixels = cellCenter(seat);
  return { x: pixels.x, y: pixels.y + SEATED_Y_OFFSET };
}

function kitchenCell(from) {
  const kitchen = state.kitchens[0];
  return kitchen ? nearestKitchenServiceCell(from, kitchen)?.cell : null;
}

function toiletCell(from) {
  const toilet = state.toilets[0];
  return toilet ? nearestServiceCell(from, toilet)?.cell : null;
}

function validatePlacement() {
  if (!state.tables.length || !state.kitchens.length || !state.toilets.length) {
    return "最少需要一張餐桌、一個廚房和一個廁所。";
  }
  if (!hiredStaff().length) return "最少需要聘請一位侍應。";
  if (availableMenuStock() <= 1) return "開店前今日菜單必須準備多過 1 份食物。";
  const overlap = findOverlap();
  if (overlap) return `${objectConfig[overlap.a.type].label} 和 ${objectConfig[overlap.b.type].label} 重疊了。`;
  const blocked = buildBlockedGrid();
  const entrance = doorCell();
  if (!entrance) return "固定門口位置被阻擋了，請移開下方中間的物件。";
  const usedStarts = new Set();
  for (const staff of hiredStaff()) {
    const start = staffStartCell(staff);
    if (!isCellOpen(start, blocked)) return `${staff.name} 的初始位置被阻擋了。`;
    if (usedStarts.has(key(start))) return "有侍應重疊在同一格，請拖開。";
    usedStarts.add(key(start));
    if (!aStar(start, entrance, blocked)) return `${staff.name} 無法由初始位置走到門口。`;
  }
  if (!kitchenServiceCell(state.kitchens[0], blocked)) return "廚房正下方必須保留通道，侍應才可拿菜。";
  for (const table of state.tables) {
    const seat = nearestServiceCell(entrance, table, blocked);
    if (!seat) return "門口到其中一張餐桌沒有可行路徑。";
    if (!kitchenCell(seat.cell)) return "其中一張餐桌到廚房沒有可行路徑。";
  }
  if (!toiletCell(entrance)) return "門口到廁所沒有可行路徑。";
  return "";
}

function objectsOverlap(a, b) {
  return (
    a.gridX < b.gridX + b.cols &&
    a.gridX + a.cols > b.gridX &&
    a.gridY < b.gridY + b.rows &&
    a.gridY + a.rows > b.gridY
  );
}

function findOverlap() {
  const objects = allPlacedObjects();
  for (let i = 0; i < objects.length; i += 1) {
    for (let j = i + 1; j < objects.length; j += 1) {
      if (objectsOverlap(objects[i], objects[j])) return { a: objects[i], b: objects[j] };
    }
  }
  return null;
}

function openRestaurant() {
  if (state.mode !== "setup") return;
  syncMenuFromInputs();
  const error = validatePlacement();
  if (error) {
    flash(error);
    return;
  }
  paused = false;
  ui.pause.textContent = "暫停";
  state.ingredientCost = calculateMenuCost();
  spendCash(state.ingredientCost);
  for (const food of Object.values(state.menu)) {
    food.offeredToday = food.stock > 0;
    food.todayOrders = 0;
    food.todayRating = 0;
  }
  state.mode = "open";
  state.time = 10 * 60;
  state.waiters = hiredStaff().map((stats, i) => {
    const start = staffStartCell(stats);
    const p = cellCenter(start);
    return {
      id: `w-${stats.id}`,
      type: "waiter",
      grid: { ...start },
      x: p.x,
      y: p.y,
      home: { ...start },
      speed: 2.2 + Math.random() * 1.4,
      state: "閒置",
      target: null,
      path: [],
      task: null,
      carrying: null,
      variant: stats.variant % atlasRegions.waiter.length,
      label: stats.name,
      facing: "down",
      stats
    };
  });
  selectedObject = null;
  flash("開店！目標是現金達到30萬！");
}

function createWaiterStats(index) {
  const base = {
    charm: 2 + Math.floor(Math.random() * 4),
    patience: 2 + Math.floor(Math.random() * 4)
  };
  const skills = {
    serve: { label: "送餐", level: 1 + (index % 2), xp: 0 },
    seat: { label: "帶位", level: 1 + ((index + 1) % 2), xp: 0 },
    checkout: { label: "結帳", level: 1, xp: 0 },
    toilet: { label: "洗廁所", level: 1, xp: 0 }
  };
  return {
    base,
    skills,
    happiness: 72 + Math.floor(Math.random() * 18),
    actions: 0,
    otSeconds: 0
  };
}

function skillForTask(kind) {
  return { seat: "seat", order: "serve", serveFood: "serve", clean: "checkout", cleanToilet: "toilet" }[kind] || "serve";
}

function xpNeeded(level) {
  return 12 + level * 8;
}

function happinessFactor(waiter) {
  return Math.max(0.55, Math.min(1.25, (waiter.stats?.happiness || 70) / 80));
}

function skillFactor(waiter, skillName) {
  const level = waiter.stats?.skills?.[skillName]?.level || 1;
  return 1 + (level - 1) * 0.13;
}

function effectiveSpeed(waiter, skillName) {
  return waiter.speed * skillFactor(waiter, skillName) * happinessFactor(waiter);
}

function adjustWaiterHappiness(waiter, amount) {
  if (!waiter?.stats) return;
  const patience = waiter.stats.base.patience || 3;
  const scaled = amount < 0 ? amount * (6 / (patience + 2)) : amount * (0.7 + patience * 0.08);
  waiter.stats.happiness = Math.max(0, Math.min(100, Math.round((waiter.stats.happiness + scaled) * 10) / 10));
}

function adjustAllWaiterHappiness(amount) {
  for (const waiter of state.waiters) adjustWaiterHappiness(waiter, amount);
}

function gainWaiterXp(waiter, skillName) {
  const skill = waiter.stats?.skills?.[skillName];
  if (!skill) return;
  skill.xp += 1;
  waiter.stats.actions += 1;
  if (skill.xp >= xpNeeded(skill.level)) {
    skill.xp = 0;
    skill.level += 1;
  }
}

function applyCharm(waiter, customer) {
  if (!waiter?.stats || !customer?.needLimit || customer.state === "離開") return;
  const charm = waiter.stats.base.charm || 1;
  if (Math.random() < charm * 0.08) {
    customer.needTimer = Math.min(customer.needLimit, customer.needTimer + 1.5 + charm * 0.8);
  }
}

function settleDay() {
  const salaries = state.waiters.reduce((sum, waiter) => sum + (waiter.stats?.salary || 0), 0);
  const rent = state.day % 7 === 0 ? WEEKLY_RENT : 0;
  const net = state.gross - salaries - state.ingredientCost - rent;
  spendCash(salaries);
  if (rent) spendCash(rent);
  state.negativeCashDays = state.cash < 0 ? state.negativeCashDays + 1 : 0;
  state.settlement = {
    gross: state.gross,
    salaries,
    ingredients: state.ingredientCost,
    rent,
    net,
    negativeCashDays: state.negativeCashDays,
    leftovers: menuLeftovers()
  };
  adjustAllWaiterHappiness(50);
  state.dayEnded = true;
  state.mode = "ended";
  flash(`營業完結：總收入 $${state.gross}，淨利 $${net}。`);
  maybeShowVictory();
  if (state.negativeCashDays >= 3) {
    state.gameOver = true;
    showResultPopup("Game Over", "餐廳連續 3 天結算後現金為負數，資金鏈斷裂。請按「重新開始」重新經營。", "gameover");
  }
}

function endDayIfReady() {
  const shouldClose = state.time >= 22 * 60 || isMenuSoldOut();
  const toiletCleaningActive = state.toilets.some(toilet => toilet.cleaning || toilet.cleaningAssigned) || state.waiters.some(waiter => waiter.task?.kind === "cleanToilet");
  if (!state.dayEnded && shouldClose && state.customers.length === 0 && state.tasks.length === 0 && !toiletCleaningActive) settleDay();
}

function flash(message) {
  ui.toast.textContent = message;
  state.messageTimer = 4.5;
}

function setPath(actor, target) {
  const path = aStar(actor.grid, target);
  actor.target = target;
  actor.path = path ? path.slice(1) : [];
  return path;
}

function setNeed(customer, label, limit) {
  customer.needLabel = label;
  customer.needLimit = limit * (customer.waitMultiplier || 1);
  customer.needTimer = customer.needLimit;
}

function clearNeed(customer) {
  customer.needLabel = "";
  customer.needLimit = 0;
  customer.needTimer = 0;
}

function needRatio(customer) {
  if (!customer.needLimit) return 1;
  return Math.max(0, Math.min(1, customer.needTimer / customer.needLimit));
}

function needColor(customer) {
  const ratio = needRatio(customer);
  if (ratio > 0.55) return "#7ee26f";
  if (ratio > 0.25) return "#ffd85a";
  return "#ff6961";
}

function moodColor(mood) {
  if (mood === "滿足") return "#dffad7";
  if (mood === "沒甚麼特別") return "#fff1a8";
  return "#ff6961";
}

function tickNeed(customer, dt) {
  if (!customer.needLimit || customer.state === "離開") return;
  customer.needTimer -= dt;
  if (customer.needTimer <= 0) abandonCustomer(customer);
}

function adjustSatisfaction(delta) {
  state.satisfaction = Math.round((state.satisfaction + delta) * 10) / 10;
}

function recordSale(customer) {
  state.gross += customer.bill;
  state.totalGross += customer.bill;
  receiveCash(customer.bill);
  state.served += 1;
  state.totalServed += 1;
  checkFoodUnlocks();
}

function tasteExitMood(customer) {
  const taste = customer.food?.taste ?? 50;
  const need = customer.tasteNeed ?? 55;
  if (taste < need * 0.72) return { mood: "憤怒", reason: "taste" };
  if (taste < need) return { mood: "沒甚麼特別", reason: "" };
  return { mood: "滿足", reason: "" };
}

function applyFoodRating(customer, mood) {
  const food = state.menu[customer.foodKey];
  if (!food) return;
  const delta = mood === "滿足" ? 1 : mood === "憤怒" ? -1 : 0;
  food.todayRating = (food.todayRating || 0) + delta;
  food.totalRating = (food.totalRating || 0) + delta;
}

function setStreetExit(customer) {
  const goRight = customer.x < W / 2;
  customer.facing = goRight ? "right" : "left";
  customer.streetTarget = {
    x: goRight ? W + 90 : -90,
    y: Math.max(streetY - 10, Math.min(H - 34, customer.streetY || streetY))
  };
  customer.streetSpeed = customer.streetSpeed || customer.speed * 40;
  customer.path = [];
  customer.leavingPhase = "street";
  customer.y = customer.streetTarget.y;
}

function sendCustomerAway(customer, mood, countAsLost = true, fromInside = true, reason = "") {
  clearNeed(customer);
  customer.state = "離開";
  customer.assigned = true;
  customer.leavingMood = mood;
  customer.angerReason = reason;
  customer.queueTarget = null;
  if (countAsLost) state.lost += 1;
  if (mood === "滿足") {
    adjustSatisfaction(SATISFACTION_DELTA.satisfied);
    adjustAllWaiterHappiness(0.45);
  }
  if (mood === "憤怒" && reason && SATISFACTION_DELTA[reason]) {
    adjustSatisfaction(SATISFACTION_DELTA[reason]);
    adjustAllWaiterHappiness(-0.9);
  }
  if (fromInside) {
    const exit = doorPixels();
    customer.x = exit.x;
    customer.y = customer.streetY || streetY;
    setStreetExit(customer);
  } else {
    setStreetExit(customer);
  }
}

function cancelCustomerWork(customer) {
  for (let i = state.tasks.length - 1; i >= 0; i -= 1) {
    if (state.tasks[i].customer === customer) state.tasks.splice(i, 1);
  }
  for (const waiter of state.waiters) {
    if (waiter.task?.customer === customer) finishWaiterTask(waiter);
  }
}

function releaseCustomerTable(customer) {
  if (!customer.table) return;
  customer.table.dirty = false;
  customer.table.order = null;
  customer.table.isOccupied = false;
  customer.table.occupiedBy = null;
  customer.orderTaskQueued = false;
  customer.serveTaskQueued = false;
}

function abandonCustomer(customer) {
  if (customer.state === "離開") return;
  const table = customer.table;
  const wasWaitingForFood = customer.state === "等餐" || table?.order === "waiting";
  const wasCheckingOut = customer.state === "結帳";
  const reason = customer.state === "等待中" ? "waiting" : wasWaitingForFood ? "food" : wasCheckingOut ? "checkout" : "";
  let paid = false;

  cancelCustomerWork(customer);
  if (wasWaitingForFood) {
    state.wastedFood += 1;
  }
  if (wasCheckingOut && Math.random() > CHECKOUT_WALKOUT_CHANCE) {
    state.gross += customer.bill;
    state.totalGross += customer.bill;
    receiveCash(customer.bill);
    paid = true;
  }
  if (table) releaseCustomerTable(customer);
  if (wasCheckingOut && !paid) state.walkouts += 1;
  const fromInside = customer.state !== "等待中";
  sendCustomerAway(customer, "憤怒", true, fromInside, reason);
}

function maybeUseToilet(customer) {
  const toilet = state.toilets[0];
  if (!toilet || customer.usedToilet || customer.state !== "用餐") return;
  customer.usedToilet = true;
  const table = customer.table;
  const seat = table ? tableSeatCell(table) : null;
  const toiletSpot = toiletCell(customer.grid || seat || doorCell());
  if (!toiletSpot || !seat) return;

  const toiletPixels = cellCenter(toiletSpot);
  customer.x = toiletPixels.x;
  customer.y = toiletPixels.y;
  customer.grid = { ...toiletSpot };

  const baseDirt = customer.toiletDirt || 10;
  const dirt = baseDirt * (0.65 + Math.random() * 0.9);
  toilet.cleanliness = Math.max(0, toilet.cleanliness - dirt);
  if (toilet.cleanliness < TOILET_DIRTY_THRESHOLD && Math.random() < (customer.dirtyAnger || 0.25)) {
    releaseCustomerTable(customer);
    sendCustomerAway(customer, "憤怒", true, true, "toilet");
    return;
  }

  const seatPixels = seatedPixels(seat);
  customer.x = seatPixels.x;
  customer.y = seatPixels.y;
  customer.grid = { ...seat };
}

function activityName(customer) {
  if (customer.state === "等待中" || customer.state === "帶位中") return "等位";
  if (customer.state === "思考") return "思考點菜";
  if (customer.state === "點餐") return "點餐";
  if (customer.state === "等餐") return "等待上菜";
  if (customer.state === "用餐") return customer.usedToilet ? "用餐/已用廁" : "用餐";
  if (customer.state === "結帳") return "結帳";
  if (customer.state === "離開") return customer.leavingMood || "離開";
  return customer.state;
}

function trackCustomerActivity(customer, dt) {
  if (!customer.waitStats) customer.waitStats = {};
  const name = activityName(customer);
  customer.currentActivity = name;
  customer.waitStats[name] = (customer.waitStats[name] || 0) + dt;
}

function formatSeconds(value = 0) {
  return `${Math.floor(value)}s`;
}

function angerReasonText(reason) {
  return {
    waiting: "等位太久",
    food: "上菜太久",
    checkout: "結帳太久",
    toilet: "廁所太髒",
    soldout: "想點的菜賣完",
    taste: "味道太差"
  }[reason] || "需求未滿足";
}

function customerStatusText(customer) {
  if (customer.leavingMood === "憤怒") return `憤怒(${angerReasonText(customer.angerReason)})`;
  if (customer.leavingMood === "滿足") return "滿足";
  if (customer.leavingMood) return customer.leavingMood;
  return customer.state;
}

function moveAlongPath(actor, dt, speedOverride = null) {
  if (!actor.path.length) return true;
  const next = actor.path[0];
  const target = cellCenter(next);
  const dx = target.x - actor.x;
  const dy = target.y - actor.y;
  if (actor.type === "waiter") {
    actor.facing = Math.abs(dx) > Math.abs(dy) ? (dx >= 0 ? "right" : "left") : (dy >= 0 ? "down" : "up");
  }
  const distance = Math.hypot(dx, dy);
  const pixelsPerSecond = (speedOverride || actor.speed) * Math.min(grid.w, grid.h);
  if (distance <= pixelsPerSecond * dt || distance < 1) {
    actor.x = target.x;
    actor.y = target.y;
    actor.grid = { ...next };
    actor.path.shift();
    return actor.path.length === 0;
  }
  actor.x += (dx / distance) * pixelsPerSecond * dt;
  actor.y += (dy / distance) * pixelsPerSecond * dt;
  return false;
}

function pathDistance(from, target) {
  const path = aStar(from, target);
  return path ? path.length : Infinity;
}

function nearestFreeWaiter(targetCell) {
  return state.waiters
    .filter(w => !w.task && w.state === "閒置")
    .sort((a, b) => pathDistance(a.grid, targetCell) - pathDistance(b.grid, targetCell))[0];
}

function nearestFreeTable(fromCell) {
  return state.tables
    .filter(t => !t.isOccupied && !t.dirty)
    .map(table => ({ table, seat: nearestServiceCell(fromCell, table) }))
    .filter(item => item.seat)
    .sort((a, b) => a.seat.path.length - b.seat.path.length)[0];
}

function dirtyToiletTasks() {
  return state.toilets
    .filter(toilet => toilet.cleanliness !== null && toilet.cleanliness < TOILET_DIRTY_THRESHOLD && !toilet.cleaning && !toilet.cleaningAssigned)
    .map(toilet => {
      const from = doorCell() || { x: toilet.gridX, y: toilet.gridY };
      const service = nearestServiceCell(from, toilet);
      return service ? { toilet, service } : null;
    })
    .filter(Boolean);
}

function isPeakHour() {
  return (
    (state.time >= LUNCH_PEAK.start && state.time < LUNCH_PEAK.end) ||
    (state.time >= DINNER_PEAK.start && state.time < DINNER_PEAK.end)
  );
}

function trafficProfile() {
  if (state.mode !== "open" || state.time >= 22 * 60 || isMenuSoldOut()) return { spawnMin: 1.2, spawnMax: 1.8, enterChance: 0 };
  if (isPeakHour()) return { spawnMin: 0.35, spawnMax: 0.8, enterChance: 0.62 };
  return { spawnMin: 1.2, spawnMax: 1.9, enterChance: 0.3 };
}

function waitingCustomers() {
  return state.customers.filter(customer => customer.state === "等待中" && !customer.assigned);
}

function queuedCustomers() {
  return state.customers.filter(customer => customer.state === "等待中" || customer.state === "帶位中");
}

function queueSpot(index) {
  const entrancePixels = doorPixels();
  const col = index % QUEUE_PER_ROW;
  const row = Math.floor(index / QUEUE_PER_ROW);
  const spacingX = 42;
  const spacingY = 36;
  const left = Math.max(42, Math.min(W - 42 - (QUEUE_PER_ROW - 1) * spacingX, entrancePixels.x));
  const firstRowY = entrancePixels.y + grid.h / 2 + 12;
  return {
    x: left + col * spacingX,
    y: Math.min(streetY - 4, firstRowY + row * spacingY)
  };
}

function updateQueuePositions() {
  queuedCustomers().forEach((customer, index) => {
    customer.queueIndex = index;
    customer.queueTarget = queueSpot(index);
    customer.x = customer.queueTarget.x;
    customer.y = customer.queueTarget.y;
  });
}

function pickWeighted(weights) {
  const roll = Math.random();
  let cursor = 0;
  for (const [keyName, weight] of Object.entries(weights)) {
    cursor += weight;
    if (roll <= cursor) return keyName;
  }
  return Object.keys(weights).at(-1);
}

function priceCategory(price) {
  if (price <= 100) return "low";
  if (price <= 300) return "mid";
  return "high";
}

function menuChoicesForCategory(category) {
  return Object.entries(state.menu)
    .filter(([, food]) => food.offeredToday && priceCategory(food.price) === category)
    .map(([keyName, food]) => ({ keyName, food }));
}

function foodChoiceWeight(food) {
  return Math.max(0.2, 1 + (food.totalRating || 0) * 0.18);
}

function pickWeightedChoice(choices) {
  const total = choices.reduce((sum, choice) => sum + foodChoiceWeight(choice.food), 0);
  let roll = Math.random() * total;
  for (const choice of choices) {
    roll -= foodChoiceWeight(choice.food);
    if (roll <= 0) return choice;
  }
  return choices.at(-1);
}

function pickFoodForTier(tier) {
  const preferred = pickWeighted(tier.priceWeights);
  const categories = [preferred, "low", "mid", "high"].filter((category, index, arr) => arr.indexOf(category) === index);
  for (const category of categories) {
    const choices = menuChoicesForCategory(category);
    if (choices.length) return pickWeightedChoice(choices);
  }
  const fallback = Object.entries(state.menu)
    .filter(([, food]) => food.offeredToday)
    .map(([keyName, food]) => ({ keyName, food }));
  if (fallback.length) return pickWeightedChoice(fallback);
  const emergency = Object.entries(state.menu).map(([keyName, food]) => ({ keyName, food }));
  return emergency[Math.floor(Math.random() * emergency.length)];
}

function createCustomerProfile() {
  const tierKey = pickWeighted({ low: 0.42, mid: 0.38, high: 0.2 });
  const tier = CUSTOMER_TIERS[tierKey];
  const choice = pickFoodForTier(tier);
  const foodKey = choice?.keyName || Object.keys(state.menu)[0];
  const food = choice?.food || state.menu[foodKey];
  return {
    tier: tierKey,
    tierLabel: tier.label,
    waitMultiplier: tier.wait,
    toiletUseChance: tier.toiletUse,
    toiletDirt: tier.toiletDirt,
    dirtyAnger: tier.dirtyAnger,
    tasteNeed: tier.tasteNeed + Math.random() * 14 - 7,
    foodKey,
    food: { ...food },
    bill: food.price
  };
}

function assignTasks() {
  const queue = waitingCustomers();
  const customer = queue[0];
  if (customer && state.time < 22 * 60) {
    const entrance = doorCell();
    const tableChoice = entrance ? nearestFreeTable(entrance) : null;
    const waiter = entrance ? nearestFreeWaiter(entrance) : null;
    if (tableChoice && waiter) {
      const { table, seat } = tableChoice;
      table.isOccupied = true;
      table.occupiedBy = customer.id;
      customer.assigned = true;
      customer.state = "帶位中";
      customer.table = table;
      customer.grid = { ...entrance };
      customer.x = customer.queueTarget?.x ?? customer.x;
      customer.y = customer.queueTarget?.y ?? customer.y;
      waiter.task = { kind: "seat", customer, table, seat: seat.cell, step: 0 };
      waiter.state = "帶位中";
      adjustWaiterHappiness(waiter, -0.2);
      applyCharm(waiter, customer);
      setPath(waiter, entrance);
    }
  }

  for (const task of [...state.tasks]) {
    const waiter = nearestFreeWaiter(task.from || task.target);
    if (!waiter) continue;
    waiter.task = { ...task, step: 0 };
    waiter.state = task.kind === "order" ? "點菜中" : task.kind === "serveFood" ? "送餐中" : "清理中";
    adjustWaiterHappiness(waiter, -0.2);
    applyCharm(waiter, task.customer);
    setPath(waiter, task.from || task.target);
    state.tasks.splice(state.tasks.indexOf(task), 1);
  }

  for (const dirty of dirtyToiletTasks()) {
    const waiter = nearestFreeWaiter(dirty.service.cell);
    if (!waiter) continue;
    dirty.toilet.cleaningAssigned = true;
    dirty.toilet.cleanProgress = 0;
    waiter.task = { kind: "cleanToilet", toilet: dirty.toilet, target: dirty.service.cell, step: 0, cleanTimer: 0 };
    waiter.state = "清理中";
    adjustWaiterHappiness(waiter, -0.25);
    setPath(waiter, dirty.service.cell);
  }
}

function finishWaiterTask(waiter) {
  waiter.task = null;
  waiter.state = "閒置";
  waiter.target = null;
  waiter.carrying = null;
  setPath(waiter, waiter.home);
}

function updateWaiter(waiter, dt) {
  const task = waiter.task;
  if (!task) {
    if (waiter.path.length) moveAlongPath(waiter, dt);
    return;
  }
  const skillName = skillForTask(task.kind);
  const taskSpeed = effectiveSpeed(waiter, skillName);

  if (task.kind === "seat") {
    if (task.step === 0 && moveAlongPath(waiter, dt, taskSpeed)) {
      task.customer.state = "入座";
      const seatPixels = seatedPixels(task.seat);
      task.customer.grid = { ...task.seat };
      task.customer.x = seatPixels.x;
      task.customer.y = seatPixels.y;
      setPath(waiter, task.seat);
      task.step = 1;
    } else if (task.step === 1) {
      const waiterArrived = moveAlongPath(waiter, dt, taskSpeed);
      if (waiterArrived) {
        task.customer.state = "思考";
        task.customer.table = task.table;
        task.customer.timer = 3 + Math.random() * 8;
        clearNeed(task.customer);
        gainWaiterXp(waiter, "seat");
        adjustWaiterHappiness(waiter, 0.15);
        finishWaiterTask(waiter);
      }
    }
  }

  if (task.kind === "order") {
    if (task.step === 0 && moveAlongPath(waiter, dt, taskSpeed)) {
      const menuItem = state.menu[task.customer.foodKey];
      if (menuItem) {
        menuItem.todayOrders = (menuItem.todayOrders || 0) + 1;
        menuItem.totalOrders = (menuItem.totalOrders || 0) + 1;
      }
      if (!menuItem || menuItem.stock <= 0) {
        releaseCustomerTable(task.customer);
        sendCustomerAway(task.customer, "憤怒", true, true, "soldout");
        finishWaiterTask(waiter);
        return;
      }
      menuItem.stock -= 1;
      task.customer.food = { ...menuItem };
      task.customer.bill = menuItem.price;
      task.customer.foodReserved = true;
      task.customer.orderTaskQueued = false;
      task.customer.serveTaskQueued = false;
      task.customer.cookTimer = menuItem.cookTime || 6;
      task.customer.table.order = "waiting";
      task.customer.state = "等餐";
      setNeed(task.customer, "等待上菜", NEED_LIMITS.food);
      finishWaiterTask(waiter);
    }
  }

  if (task.kind === "serveFood") {
    if (task.step === 0 && moveAlongPath(waiter, dt, taskSpeed)) {
      waiter.carrying = "food";
      setPath(waiter, task.seat);
      task.step = 1;
    } else if (task.step === 1 && moveAlongPath(waiter, dt, taskSpeed)) {
      waiter.carrying = null;
      clearNeed(task.customer);
      task.customer.state = "用餐";
      task.customer.serveTaskQueued = false;
      task.customer.cookTimer = 0;
      task.customer.timer = 15 + Math.random() * 12;
      task.customer.willUseToilet = Math.random() < (task.customer.toiletUseChance || 0);
      task.customer.usedToilet = false;
      task.customer.toiletAt = task.customer.timer * (0.35 + Math.random() * 0.4);
      task.table.order = "served";
      gainWaiterXp(waiter, "serve");
      adjustWaiterHappiness(waiter, 0.15);
      finishWaiterTask(waiter);
    }
  }

  if (task.kind === "clean" && moveAlongPath(waiter, dt, taskSpeed)) {
    task.table.dirty = false;
    task.table.order = null;
    task.table.isOccupied = false;
    task.table.occupiedBy = null;
    gainWaiterXp(waiter, "checkout");
    const tasteResult = tasteExitMood(task.customer);
    const tasteWalkout = tasteResult.reason === "taste" && Math.random() < TASTE_WALKOUT_CHANCE;
    if (tasteWalkout) {
      state.walkouts += 1;
      flash("有人吃霸王餐了！");
    } else {
      recordSale(task.customer);
    }
    applyFoodRating(task.customer, tasteResult.mood);
    if (tasteResult.mood === "滿足") adjustWaiterHappiness(waiter, 0.2);
    sendCustomerAway(task.customer, tasteResult.mood, tasteResult.mood === "憤怒", true, tasteResult.reason);
    finishWaiterTask(waiter);
  }

  if (task.kind === "cleanToilet") {
    if (task.step === 0 && moveAlongPath(waiter, dt, taskSpeed)) {
      task.step = 1;
      task.toilet.cleaning = true;
      task.toilet.cleaningAssigned = false;
    }
    if (task.step === 1) {
      task.cleanTimer += dt * skillFactor(waiter, "toilet") * happinessFactor(waiter);
      adjustWaiterHappiness(waiter, -0.025 * dt);
      task.toilet.cleanProgress = Math.min(1, task.cleanTimer / TOILET_CLEAN_TIME);
      if (task.cleanTimer >= TOILET_CLEAN_TIME) {
        task.toilet.cleanliness = 100;
        task.toilet.cleaning = false;
        task.toilet.cleaningAssigned = false;
        task.toilet.cleanProgress = 0;
        gainWaiterXp(waiter, "toilet");
        adjustWaiterHappiness(waiter, 0.15);
        finishWaiterTask(waiter);
      }
    }
  }
}

function updateCustomers(dt) {
  updateQueuePositions();
  for (const customer of [...state.customers]) {
    trackCustomerActivity(customer, dt);
    if (customer.state === "等待中") {
      if (state.time >= 22 * 60) {
        cancelCustomerWork(customer);
        releaseCustomerTable(customer);
        sendCustomerAway(customer, "", false, false);
        continue;
      }
      tickNeed(customer, dt);
      if (customer.state === "離開") continue;
      if (customer.queueTarget) {
        customer.x = customer.queueTarget.x;
        customer.y = customer.queueTarget.y;
      }
    }
    if (customer.state === "思考") {
      customer.timer -= dt * 4;
      if (customer.timer <= 0) customer.state = "點餐";
    }
    if (customer.state === "點餐") {
      if (!customer.orderTaskQueued) {
        const seat = tableSeatCell(customer.table);
        const kitchen = kitchenCell(seat);
        if (seat && kitchen) {
          state.tasks.push({ kind: "order", customer, table: customer.table, seat, kitchen, from: seat, target: seat });
          customer.orderTaskQueued = true;
        }
      }
    }
    if (customer.state === "等餐") {
      tickNeed(customer, dt);
      if (customer.state === "離開") continue;
      customer.cookTimer = Math.max(0, (customer.cookTimer || 0) - dt * 4);
      if (customer.cookTimer <= 0 && !customer.serveTaskQueued) {
        const seat = tableSeatCell(customer.table);
        const kitchen = kitchenCell(seat);
        if (seat && kitchen) {
          state.tasks.push({ kind: "serveFood", customer, table: customer.table, seat, kitchen, from: kitchen, target: seat });
          customer.serveTaskQueued = true;
        }
      }
    }
    if (customer.state === "用餐") {
      customer.timer -= dt * 4;
      if (customer.willUseToilet && !customer.usedToilet && customer.timer <= customer.toiletAt) maybeUseToilet(customer);
      if (customer.state === "離開") continue;
      if (customer.timer <= 0) {
        const seat = tableSeatCell(customer.table);
        customer.state = "結帳";
        customer.table.dirty = true;
        setNeed(customer, "結帳", NEED_LIMITS.checkout);
        if (seat) state.tasks.push({ kind: "clean", customer, table: customer.table, seat, from: seat, target: seat });
      }
    }
    if (customer.state === "結帳") tickNeed(customer, dt);
    if (customer.state === "離開") {
      if (customer.leavingPhase === "street") {
        const dx = customer.streetTarget.x - customer.x;
        const dy = customer.streetTarget.y - customer.y;
        const distance = Math.hypot(dx, dy);
        const step = (customer.streetSpeed || customer.speed * 46) * dt;
        if (distance <= step || distance < 1) {
          state.customers.splice(state.customers.indexOf(customer), 1);
        } else {
          customer.x += (dx / distance) * step;
          customer.y += (dy / distance) * step;
        }
      }
    }
  }
}

function spawnPasser(dt) {
  state.spawnTick -= dt;
  if (state.spawnTick > 0) return;
  const traffic = trafficProfile();
  state.spawnTick = traffic.spawnMin + Math.random() * (traffic.spawnMax - traffic.spawnMin);
  const dir = Math.random() > 0.5 ? 1 : -1;
  state.passers.push({
    x: dir > 0 ? -50 : W + 50,
    y: streetY + Math.random() * 30 - 12,
    dir,
    speed: 48 + Math.random() * 40,
    variant: Math.floor(Math.random() * atlasRegions.customer.length),
    walkVariant: Math.floor(Math.random() * 2),
    enter: state.mode === "open" && state.time < 22 * 60 && Math.random() < traffic.enterChance
  });
}

function updatePassers(dt) {
  spawnPasser(dt);
  const entrance = doorCell();
  const entrancePixels = doorPixels();
  for (const passer of [...state.passers]) {
    passer.x += passer.dir * passer.speed * dt;
    if (passer.enter && entrance && state.time < 22 * 60 && !isMenuSoldOut() && Math.abs(passer.x - entrancePixels.x) < 16 && queuedCustomers().length < QUEUE_LIMIT) {
      const queueIndex = queuedCustomers().length;
      const spot = queueSpot(queueIndex);
      const profile = createCustomerProfile();
      state.customers.push({
        id: `c${Date.now()}-${Math.random()}`,
        type: "customer",
        grid: { ...entrance },
        x: spot.x,
        y: spot.y,
        streetY: passer.y,
        streetSpeed: passer.speed,
        speed: 1.8,
        target: null,
        path: [],
        patience: 100,
        state: "等待中",
        facing: "down",
        needLabel: "",
        needLimit: 0,
        needTimer: 0,
        variant: passer.variant,
        walkVariant: passer.walkVariant,
        bill: profile.bill,
        tier: profile.tier,
        tierLabel: profile.tierLabel,
        waitMultiplier: profile.waitMultiplier,
        toiletUseChance: profile.toiletUseChance,
        toiletDirt: profile.toiletDirt,
        dirtyAnger: profile.dirtyAnger,
        foodKey: profile.foodKey,
        food: profile.food,
        waitStats: {},
        currentActivity: "等位",
        timer: 0,
        assigned: false,
        table: null,
        queueIndex,
        queueTarget: spot
      });
      setNeed(state.customers[state.customers.length - 1], "等位", NEED_LIMITS.waiting);
      state.passers.splice(state.passers.indexOf(passer), 1);
      continue;
    }
    if (passer.x < -90 || passer.x > W + 90) state.passers.splice(state.passers.indexOf(passer), 1);
  }
}

function update(dt) {
  const scaled = paused ? 0 : dt * speed;
  if (!paused && state.mode === "open") state.time += scaled * 4;
  if (!paused && (state.mode === "open" || state.mode === "ended")) updatePassers(scaled);
  if (!paused && state.mode === "open") {
    assignTasks();
    for (const waiter of state.waiters) {
      if (state.time >= 22 * 60 && waiter.task) {
        waiter.stats.otSeconds += scaled;
        adjustWaiterHappiness(waiter, -0.015 * scaled);
      }
      updateWaiter(waiter, scaled);
    }
    updateCustomers(scaled);
    endDayIfReady();
  }
  if (state.messageTimer > 0) state.messageTimer -= dt;
  ui.toast.style.opacity = state.messageTimer > 0 ? "1" : "0";
  refreshUi();
  updateCustomerPopups();
  updateStaffPopups();
  updateKitchenPopup();
}

function refreshUi() {
  const h = Math.floor(state.time / 60);
  const m = Math.floor(state.time % 60);
  const validationError = state.mode === "setup" ? validatePlacement() : "";
  ui.clock.textContent = state.mode === "setup" ? `第 ${state.day} 天清晨` : `第 ${state.day} 天 ${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  ui.cash.textContent = `現金 $${state.cash}`;
  ui.served.textContent = `今日 ${state.served} 單 / 總 ${state.totalServed} 單`;
  ui.satisfaction.textContent = `滿意度 ${state.satisfaction}`;
  ui.phase.textContent = state.mode === "setup" ? "佈置餐廳" : state.mode === "ended" ? "營業結算" : state.time >= 22 * 60 || isMenuSoldOut() ? "打烊中" : "營業中";
  ui.open.classList.toggle("ready", !validationError && state.mode === "setup");
  ui.open.hidden = state.mode !== "setup";
  ui.menuButton.hidden = state.mode !== "setup";
  ui.recruitButton.hidden = state.mode !== "setup";
  ui.open.disabled = state.mode !== "setup";
  ui.settlement.hidden = state.mode !== "ended";
  if (state.mode === "ended") updateSettlementPopup();
  ui.continue.disabled = state.gameOver;
  ui.toolbox.hidden = state.mode !== "setup";
  ui.addTable.disabled = state.mode !== "setup";
  ui.deleteTable.disabled = state.mode !== "setup" || selectedObject?.type !== "table";
  if (state.mode !== "setup") {
    ui.menu.hidden = true;
    ui.recruit.hidden = true;
  }
}

function drawAsset(type, variant, x, y, w, h) {
  if (type === "table" && assets?.tableSingle) {
    ctx.drawImage(assets.tableSingle, x - w / 2, y - h / 2, w, h);
    return true;
  }
  const spriteList = assets?.sprites?.[type];
  const sprite = spriteList?.[variant % spriteList.length];
  if (sprite) {
    ctx.drawImage(sprite, x - w / 2, y - h / 2, w, h);
    return true;
  }
  const reg = atlasRegions[type][variant % atlasRegions[type].length];
  if (!assets?.atlas || !reg) return false;
  ctx.drawImage(assets.atlas, reg[0], reg[1], reg[2], reg[3], x - w / 2, y - h / 2, w, h);
  return true;
}

function drawWaiterSprite(actor, x, y, w, h) {
  if (!assets.waiterWalk) {
    drawAsset("waiter", actor.variant || 0, x, y, w, h);
    return;
  }
  const rows = { down: 0, left: 1, right: 2, up: 3 };
  const row = rows[actor.facing || "down"] ?? 0;
  const moving = actor.path?.length || actor.task;
  const frame = moving ? Math.floor(performance.now() / 120) % 8 : 0;
  const cell = 128;
  ctx.drawImage(assets.waiterWalk, frame * cell, row * cell, cell, cell, x - w / 2, y - h / 2, w, h);
}

function drawCustomerSprite(actor, x, y, w, h, moving = false, facing = null) {
  if (isCustomerSeated(actor)) {
    const sitSprite = actor.walkVariant === 1 ? assets.customerFemaleSit : assets.customerSit;
    if (sitSprite) {
      ctx.drawImage(sitSprite, x - w / 2, y - h / 2, w, h);
      return;
    }
  }
  const sheets = assets.customerWalks || [];
  const sheet = sheets[(actor.walkVariant ?? actor.variant ?? 0) % sheets.length];
  if (!sheet) {
    drawAsset("customer", actor.variant || 0, x, y, w, h);
    return;
  }
  const rows = { down: 0, left: 1, right: 2, up: 3 };
  const row = rows[facing || actor.facing || "down"] ?? 0;
  const frame = moving ? Math.floor(performance.now() / 120) % 8 : 0;
  const cell = 128;
  ctx.drawImage(sheet, frame * cell, row * cell, cell, cell, x - w / 2, y - h / 2, w, h);
}

function isCustomerSeated(actor) {
  return actor?.type !== "waiter" && actor?.table && ["入座", "思考", "點餐", "等餐", "用餐", "結帳"].includes(actor.state);
}

function drawBubble(x, y, text, color = "#fff4cf") {
  ctx.save();
  ctx.font = "700 18px sans-serif";
  const tw = ctx.measureText(text).width;
  ctx.fillStyle = color;
  ctx.strokeStyle = "rgba(56,36,10,.35)";
  ctx.lineWidth = 3;
  roundRect(x - tw / 2 - 12, y - 32, tw + 24, 26, 8);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#2b2114";
  ctx.fillText(text, x - tw / 2, y - 13);
  ctx.restore();
}

function roundRect(x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function render() {
  debugInfo.frames += 1;
  ctx.clearRect(0, 0, W, H);
  if (assets.map) {
    ctx.drawImage(assets.map, 0, 0, W, H);
  } else {
    ctx.fillStyle = "#6f5130";
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "#9d6d3b";
    ctx.fillRect(interior.x, interior.y, interior.w, interior.h);
    ctx.fillStyle = "#3f4448";
    ctx.fillRect(0, streetY - 20, W, H - streetY + 20);
  }
  ctx.fillStyle = "rgba(255, 235, 175, 0.07)";
  ctx.fillRect(interior.x, interior.y, interior.w, interior.h);
  if (SHOW_DEBUG) drawPrimitivePlacedObjects();
  if (state.mode === "setup") drawSetupGrid();

  for (const k of state.kitchens) drawPlacedObject(k);
  for (const toilet of state.toilets) {
    drawPlacedObject(toilet);
    drawToiletStatus(toilet);
  }
  for (const t of state.tables) {
    drawPlacedObject(t);
    if (t.order === "served") drawAsset("food", t.variant, t.x + 2, t.y - 12, 21, 15);
    if (t.dirty) drawAsset("dirty", t.variant, t.x + 1, t.y - 12, 23, 15);
  }

  if (state.mode === "setup") drawSetupStaff();

  for (const passer of state.passers) {
    ctx.save();
    drawCustomerSprite(passer, passer.x, passer.y, 64, 64, true, passer.dir > 0 ? "right" : "left");
    ctx.restore();
  }

  const actors = [...state.customers, ...state.waiters].sort((a, b) => a.y - b.y);
  for (const actor of actors) {
    const isWaiter = actor.type === "waiter";
    if (isWaiter) drawWaiterSprite(actor, actor.x, actor.y, 64, 64);
    else drawCustomerSprite(actor, actor.x, actor.y, 64, 64, actor.state === "離開" && actor.leavingPhase === "street");
    if (isWaiter && actor.carrying === "food") drawAsset("food", 0, actor.x + 18, actor.y - 42, 34, 24);
    if (!isWaiter && actor.leavingMood) drawBubble(actor.x, actor.y - 42, actor.leavingMood, moodColor(actor.leavingMood));
    else if (!isWaiter && actor.state === "思考") drawBubble(actor.x, actor.y - 42, "...", "#fff1a8");
    else if (!isWaiter && actor.state === "點餐") drawBubble(actor.x, actor.y - 42, "點菜", "#fff1a8");
    else if (!isWaiter && actor.needLabel) drawBubble(actor.x, actor.y - 42, actor.needLabel, needColor(actor));
    if (!isWaiter && actor.state === "用餐") drawBubble(actor.x, actor.y - 42, "用餐", "#dffad7");
  }

  if (state.mode === "setup") drawSetupSelection();
  if (SHOW_DEBUG) drawDebugHud();
}

function drawPrimitivePlacedObjects() {
  const primitives = [
    ["#ffcc38", state.tables],
    ["#27d7ff", state.kitchens],
    ["#b58cff", state.toilets]
  ];
  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "900 16px sans-serif";
  for (const [color, items] of primitives) {
    for (const item of items) {
      const x = grid.x + item.gridX * grid.w;
      const y = grid.y + item.gridY * grid.h;
      const w = item.cols * grid.w;
      const h = item.rows * grid.h;
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.82;
      ctx.fillRect(x + 2, y + 2, w - 4, h - 4);
      ctx.globalAlpha = 1;
      ctx.strokeStyle = "#111";
      ctx.lineWidth = 3;
      ctx.strokeRect(x + 2, y + 2, w - 4, h - 4);
      ctx.fillStyle = "#111";
      ctx.fillText(objectConfig[item.type].label, x + w / 2, y + h / 2);
    }
  }
  ctx.restore();
}

function drawDebugHud() {
  const lines = [
    `debug ${DEBUG_VERSION} frame ${debugInfo.frames}`,
    `tables ${state.tables.length} kitchens ${state.kitchens.length} staff ${hiredStaff().length}`,
    `mode ${state.mode} selected ${selectedObject ? selectedObject.type : "none"}`,
    debugInfo.lastPlaced ? `last ${debugInfo.lastPlaced}` : "",
    debugInfo.lastError ? `error ${debugInfo.lastError}` : ""
  ].filter(Boolean);
  ctx.save();
  ctx.font = "700 15px sans-serif";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  const width = Math.max(...lines.map(line => ctx.measureText(line).width)) + 18;
  const hudY = 72;
  ctx.fillStyle = "rgba(0, 0, 0, 0.72)";
  ctx.fillRect(8, hudY, width, lines.length * 20 + 12);
  ctx.fillStyle = "#fff";
  lines.forEach((line, i) => ctx.fillText(line, 17, hudY + 7 + i * 20));
  ctx.restore();
}

function drawSetupGrid() {
  ctx.save();
  ctx.strokeStyle = "rgba(255, 216, 128, 0.45)";
  ctx.lineWidth = 1;
  for (let x = 0; x <= grid.cols; x += 1) {
    ctx.beginPath();
    ctx.moveTo(grid.x + x * grid.w, grid.y);
    ctx.lineTo(grid.x + x * grid.w, grid.y + grid.rows * grid.h);
    ctx.stroke();
  }
  for (let y = 0; y <= grid.rows; y += 1) {
    ctx.beginPath();
    ctx.moveTo(grid.x, grid.y + y * grid.h);
    ctx.lineTo(grid.x + grid.cols * grid.w, grid.y + y * grid.h);
    ctx.stroke();
  }
  const blocked = buildBlockedGrid();
  ctx.fillStyle = "rgba(220, 80, 72, 0.15)";
  for (let y = 0; y < grid.rows; y += 1) {
    for (let x = 0; x < grid.cols; x += 1) {
      if (blocked[y][x]) ctx.fillRect(grid.x + x * grid.w, grid.y + y * grid.h, grid.w, grid.h);
    }
  }
  ctx.restore();
}

function drawSetupSelection() {
  if (!selectedObject) return;
  ctx.save();
  ctx.strokeStyle = "rgba(84, 194, 124, 0.98)";
  ctx.fillStyle = "rgba(84, 194, 124, 0.12)";
  ctx.lineWidth = 3;
  roundRect(selectedObject.x - selectedObject.w / 2 - 8, selectedObject.y - selectedObject.h / 2 - 8, selectedObject.w + 16, selectedObject.h + 16, 10);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function drawSetupStaff() {
  ensureStaffStartPositions();
  for (const staff of hiredStaff()) {
    drawWaiterSprite({ ...staff, facing: "down", path: [] }, staff.x, staff.y, 64, 64);
    drawBubble(staff.x, staff.y - 42, staff.name, "#dffad7");
  }
}

function drawToiletStatus(toilet) {
  const clean = toilet.cleanliness >= TOILET_DIRTY_THRESHOLD;
  if (!toilet.cleaning && clean) return;
  const label = toilet.cleaning ? "清潔中" : "骯髒";
  const color = toilet.cleaning ? "#fff1a8" : "#ffb0a8";
  drawBubble(toilet.x, toilet.y - toilet.h / 2 - 10, label, color);
  if (!toilet.cleaning) return;
  const w = 82;
  const h = 9;
  const x = toilet.x - w / 2;
  const y = toilet.y + toilet.h / 2 + 8;
  ctx.save();
  ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = "#7ee26f";
  ctx.fillRect(x, y, w * toilet.cleanProgress, h);
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 1;
  ctx.strokeRect(x, y, w, h);
  ctx.restore();
}

function drawPlacedObject(item) {
  const colors = { table: "#d6a65b", kitchen: "#8fb8c8", toilet: "#b58cff" };
  ctx.save();
  ctx.fillStyle = colors[item.type] || "#d6a65b";
  ctx.globalAlpha = 0.72;
  ctx.strokeStyle = selectedObject === item ? "rgba(84, 194, 124, 0.95)" : "rgba(40, 26, 12, 0.32)";
  ctx.lineWidth = selectedObject === item ? 3 : 1;
  roundRect(item.x - item.w / 2 - 4, item.y - item.h / 2 - 4, item.w + 8, item.h + 8, 10);
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.stroke();
  ctx.fillStyle = "#1f1a12";
  ctx.font = "700 16px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(objectConfig[item.type].label, item.x, item.y);
  ctx.restore();

  const drewImage = drawAsset(item.type, item.variant, item.x, item.y, item.w, item.h);
  if (drewImage) return;
  ctx.save();
  ctx.fillStyle = colors[item.type] || "#d6a65b";
  ctx.strokeStyle = "rgba(30, 22, 12, 0.75)";
  ctx.lineWidth = 3;
  roundRect(item.x - item.w / 2, item.y - item.h / 2, item.w, item.h, 8);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#1f1a12";
  ctx.font = "700 18px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(objectConfig[item.type].label, item.x, item.y);
  ctx.restore();
}

function updateSettlementPopup() {
  const result = state.settlement || {
    gross: state.gross,
    salaries: 0,
    ingredients: state.ingredientCost,
    rent: 0,
    net: state.gross - state.ingredientCost,
    negativeCashDays: state.negativeCashDays,
    leftovers: menuLeftovers()
  };
  const leftovers = result.leftovers || [];
  ui.settlementBody.innerHTML = `
    <div class="settlement-summary">
      <div><span>總收入</span><strong>$${result.gross}</strong></div>
      <div><span>員工薪資</span><strong>$${result.salaries}</strong></div>
      <div><span>食材成本</span><strong>$${result.ingredients}</strong></div>
      <div><span>租金</span><strong>$${result.rent || 0}</strong></div>
      <div><span>淨利</span><strong>$${result.net}</strong></div>
      <div><span>現金</span><strong>$${state.cash}</strong></div>
      <div><span>滿意度</span><strong>${state.satisfaction}</strong></div>
    </div>
    <div class="settlement-line">完成 ${state.served} 單 · 流失 ${state.lost} 位 · 走數 ${state.walkouts || 0} · 浪費 ${state.wastedFood || 0} 份</div>
    <div class="settlement-line">餐廳累計營業額 $${state.totalGross} · 累計完成 ${state.totalServed} 單</div>
    ${(result.negativeCashDays || 0) > 0 ? `<div class="settlement-line">連續負現金日數 ${result.negativeCashDays} / 3</div>` : ""}
    ${(result.rent || 0) > 0 ? `<div class="settlement-line">今日已交租 $${result.rent}</div>` : ""}
    <div class="settlement-subtitle">今日剩餘菜式</div>
    <div class="leftover-list">
      ${leftovers.map(food => `<div>${food.name}: 剩 ${food.stock} 份（已計成本 $${food.value}）</div>`).join("")}
    </div>
  `;
}

function loop(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  try {
    update(dt);
  } catch (error) {
    debugInfo.lastError = error?.message || String(error);
  }
  try {
    render();
  } catch (error) {
    debugInfo.lastError = error?.message || String(error);
    ctx.save();
    ctx.fillStyle = "rgba(160, 0, 0, 0.88)";
    ctx.fillRect(0, 0, W, 90);
    ctx.fillStyle = "#fff";
    ctx.font = "700 18px sans-serif";
    ctx.fillText(`Render error: ${debugInfo.lastError}`, 20, 32);
    ctx.restore();
  }
  requestAnimationFrame(loop);
}

function canvasPoint(evt) {
  const rect = canvas.getBoundingClientRect();
  return { x: ((evt.clientX - rect.left) / rect.width) * W, y: ((evt.clientY - rect.top) / rect.height) * H };
}

function popupPoint(evt) {
  const rect = ui.popups.getBoundingClientRect();
  return {
    x: evt.clientX - rect.left,
    y: evt.clientY - rect.top,
    maxX: rect.width,
    maxY: rect.height
  };
}

function popupPosition(point, width, height) {
  const maxLeft = Math.max(12, point.maxX - width - 12);
  const maxTop = Math.max(12, point.maxY - height - 12);
  return {
    left: Math.min(maxLeft, Math.max(12, point.x + 14)),
    top: Math.min(maxTop, Math.max(12, point.y - 18))
  };
}

function objectAt(x, y) {
  const renderOrder = [...state.kitchens, ...state.toilets, ...state.tables, ...hiredStaff()];
  for (let i = renderOrder.length - 1; i >= 0; i -= 1) {
    const item = renderOrder[i];
    if (x >= item.x - item.w / 2 && x <= item.x + item.w / 2 && y >= item.y - item.h / 2 && y <= item.y + item.h / 2) return item;
  }
  return null;
}

function customerAt(x, y) {
  const customers = [...state.customers].reverse();
  return customers.find(customer => (
    x >= customer.x - 32 &&
    x <= customer.x + 32 &&
    y >= customer.y - 36 &&
    y <= customer.y + 32
  ));
}

function waiterAt(x, y) {
  const waiters = [...state.waiters].reverse();
  return waiters.find(waiter => (
    x >= waiter.x - 32 &&
    x <= waiter.x + 32 &&
    y >= waiter.y - 36 &&
    y <= waiter.y + 32
  ));
}

function kitchenAt(x, y) {
  const kitchens = [...state.kitchens].reverse();
  return kitchens.find(kitchen => (
    x >= kitchen.x - kitchen.w / 2 &&
    x <= kitchen.x + kitchen.w / 2 &&
    y >= kitchen.y - kitchen.h / 2 &&
    y <= kitchen.y + kitchen.h / 2
  ));
}

function openCustomerPopup(customer, screenPoint) {
  if (customerPopups.has(customer.id)) return;
  const popup = document.createElement("div");
  popup.className = "customer-popup";
  const position = popupPosition(screenPoint, 280, 250);
  popup.style.left = `${position.left}px`;
  popup.style.top = `${position.top}px`;
  popup.innerHTML = `
    <div class="popup-head">
      <span></span>
      <button class="popup-close" type="button">×</button>
    </div>
    <div class="popup-body">
      <img alt="食客">
      <div class="popup-data"></div>
    </div>
  `;
  ui.popups.appendChild(popup);
  const record = { customerId: customer.id, el: popup };
  customerPopups.set(customer.id, record);
  wirePopupChrome(popup, () => customerPopups.delete(customer.id));
  updateCustomerPopup(record);
}

function updateCustomerPopups() {
  for (const record of [...customerPopups.values()]) updateCustomerPopup(record);
}

function updateCustomerPopup(record) {
  const customer = state.customers.find(item => item.id === record.customerId);
  const el = record.el;
  if (!customer) {
    el.querySelector(".popup-head span").textContent = "食客已離開";
    el.querySelector(".popup-data").innerHTML = "<span>狀態</span> 已離場";
    return;
  }
  const head = el.querySelector(".popup-head span");
  const img = el.querySelector("img");
  const data = el.querySelector(".popup-data");
  const waits = Object.entries(customer.waitStats || {})
    .map(([name, value]) => `${name}:${formatSeconds(value)}`)
    .join(" / ") || "未開始";
  const tolerance = customer.needLimit
    ? `${formatSeconds(customer.needTimer)} / ${formatSeconds(customer.needLimit)}`
    : "不適用";
  head.textContent = `${customer.tierLabel || "食客"}食客`;
  img.src = `assets/sprites/customer-${customer.variant % spriteCounts.customer}.png?v=17`;
  data.innerHTML = `
    <div><span>即時狀態</span> ${customerStatusText(customer)}</div>
    <div><span>現時活動</span> ${activityName(customer)}</div>
    <div><span>接受度</span> ${tolerance}</div>
    <div><span>活動等待</span> ${waits}</div>
    <div><span>等級</span> ${customer.tierLabel || "-"}</div>
    <div><span>點餐</span> ${customer.food?.name || "-"}</div>
    <div><span>預備消費</span> $${customer.bill || 0}</div>
    <div><span>廁所</span> ${customer.usedToilet ? "已使用" : customer.willUseToilet ? "可能使用" : "未使用"}</div>
  `;
}

function openStaffPopup(waiter, screenPoint) {
  if (staffPopups.has(waiter.id)) return;
  const popup = document.createElement("div");
  popup.className = "customer-popup";
  const position = popupPosition(screenPoint, 280, 260);
  popup.style.left = `${position.left}px`;
  popup.style.top = `${position.top}px`;
  popup.innerHTML = `
    <div class="popup-head">
      <span></span>
      <button class="popup-close" type="button">×</button>
    </div>
    <div class="popup-body">
      <img alt="員工">
      <div class="popup-data"></div>
    </div>
  `;
  ui.popups.appendChild(popup);
  const record = { waiterId: waiter.id, el: popup };
  staffPopups.set(waiter.id, record);
  wirePopupChrome(popup, () => staffPopups.delete(waiter.id));
  updateStaffPopup(record);
}

function wirePopupChrome(popup, onClose) {
  const closeButton = popup.querySelector(".popup-close");
  closeButton.addEventListener("pointerdown", event => {
    event.preventDefault();
    event.stopPropagation();
    popup.remove();
    onClose();
  });
  closeButton.addEventListener("click", event => {
    event.preventDefault();
    event.stopPropagation();
  });
  const head = popup.querySelector(".popup-head");
  let drag = null;
  head.addEventListener("pointerdown", event => {
    if (event.target.closest(".popup-close")) return;
    drag = { x: event.clientX, y: event.clientY, left: parseFloat(popup.style.left), top: parseFloat(popup.style.top) };
    head.setPointerCapture(event.pointerId);
  });
  head.addEventListener("pointermove", event => {
    if (!drag) return;
    popup.style.left = `${drag.left + event.clientX - drag.x}px`;
    popup.style.top = `${drag.top + event.clientY - drag.y}px`;
  });
  head.addEventListener("pointerup", () => {
    drag = null;
  });
}

function updateStaffPopups() {
  for (const record of [...staffPopups.values()]) updateStaffPopup(record);
}

function openKitchenPopup(kitchen, screenPoint) {
  if (kitchenPopup) return;
  const popup = document.createElement("div");
  popup.className = "customer-popup kitchen-popup";
  const position = popupPosition(screenPoint, 450, 300);
  popup.style.left = `${position.left}px`;
  popup.style.top = `${position.top}px`;
  popup.innerHTML = `
    <div class="popup-head">
      <span>廚房庫存</span>
      <button class="popup-close" type="button">×</button>
    </div>
    <div class="popup-body">
      <div class="popup-data kitchen-data"></div>
    </div>
  `;
  ui.popups.appendChild(popup);
  kitchenPopup = { kitchenId: kitchen.id, el: popup };
  wirePopupChrome(popup, () => {
    kitchenPopup = null;
  });
  updateKitchenPopup();
}

function updateKitchenPopup() {
  if (!kitchenPopup) return;
  const data = kitchenPopup.el.querySelector(".kitchen-data");
  data.innerHTML = Object.values(state.menu).map(food => `
    <div class="kitchen-row">
      <strong>${food.name}</strong>
      <span>剩餘 ${food.stock} / 今日點 ${food.todayOrders || 0} / 總點 ${food.totalOrders || 0}</span>
      <span>今日評價 ${food.todayRating || 0} / 總評價 ${food.totalRating || 0}</span>
    </div>
  `).join("");
}

function updateStaffPopup(record) {
  const waiter = state.waiters.find(item => item.id === record.waiterId);
  const el = record.el;
  if (!waiter) {
    el.querySelector(".popup-head span").textContent = "員工未上班";
    el.querySelector(".popup-data").innerHTML = "<span>狀態</span> 未開店";
    return;
  }
  const head = el.querySelector(".popup-head span");
  const img = el.querySelector("img");
  const data = el.querySelector(".popup-data");
  const skills = Object.entries(waiter.stats.skills)
    .map(([, skill]) => `${skill.label} Lv.${skill.level} (${skill.xp}/${xpNeeded(skill.level)})`)
    .join("<br>");
  head.textContent = `員工 ${waiter.label}`;
  img.src = `assets/sprites/waiter-${waiter.variant % spriteCounts.waiter}.png?v=21`;
  data.innerHTML = `
    <div><span>即時狀態</span> ${waiter.state}</div>
    <div><span>薪金</span> $${waiter.stats.salary}</div>
    <div><span>快樂度</span> ${waiter.stats.happiness}</div>
    <div><span>基礎能力</span> 魅力 ${waiter.stats.base.charm} / 耐性 ${waiter.stats.base.patience}</div>
    <div><span>員工能力</span><br>${skills}</div>
    <div><span>完成行動</span> ${waiter.stats.actions}</div>
    <div><span>OT 時間</span> ${formatSeconds(waiter.stats.otSeconds)}</div>
    <div><span>效率倍率</span> ${happinessFactor(waiter).toFixed(2)}x</div>
  `;
}

function movePlaced(item, cell) {
  const clamped = clampCell(item, cell);
  if (isStaffStart(item)) {
    const blocked = buildBlockedGrid();
    const occupied = hiredStaff().some(staff => staff !== item && staff.gridX === clamped.x && staff.gridY === clamped.y);
    if (!isCellOpen(clamped, blocked) || occupied) return;
  }
  item.gridX = clamped.x;
  item.gridY = clamped.y;
  item.position = { x: item.gridX, y: item.gridY };
  syncObjectPixels(item);
}

function canPlaceItemAt(item, cell) {
  const original = { gridX: item.gridX, gridY: item.gridY, x: item.x, y: item.y };
  item.gridX = cell.x;
  item.gridY = cell.y;
  item.position = { x: cell.x, y: cell.y };
  syncObjectPixels(item);
  const blocked = buildBlockedGrid(item);
  const overlaps = allPlacedObjects().some(other => other !== item && objectsOverlap(item, other));
  const staffOverlap = hiredStaff().some(staff => {
    const staffCell = staffStartCell(staff);
    return staffCell.x >= item.gridX && staffCell.x < item.gridX + item.cols && staffCell.y >= item.gridY && staffCell.y < item.gridY + item.rows;
  });
  const inBounds = cell.x >= 0 && cell.y >= 0 && cell.x + item.cols <= grid.cols && cell.y + item.rows <= grid.rows;
  const hasServiceCell = item.type === "kitchen" ? Boolean(kitchenServiceCell(item, blocked)) : adjacentServiceCells(item, blocked).length > 0;
  item.gridX = original.gridX;
  item.gridY = original.gridY;
  item.position = { x: original.gridX, y: original.gridY };
  item.x = original.x;
  item.y = original.y;
  return inBounds && !overlaps && !staffOverlap && hasServiceCell;
}

function findTableSpot() {
  const probe = makePlaced("table", 0, 0, state.tables.length % spriteCounts.table);
  for (let y = grid.rows - probe.rows; y >= 0; y -= 1) {
    for (let x = 0; x <= grid.cols - probe.cols; x += 1) {
      const cell = { x, y };
      if (canPlaceItemAt(probe, cell)) return cell;
    }
  }
  return null;
}

function findTableSpots(limit = grid.cols * grid.rows) {
  const spots = [];
  const temporary = [];
  for (let i = 0; i < limit; i += 1) {
    const spot = findTableSpot();
    if (!spot) break;
    const temp = makePlaced("table", spot.x, spot.y, (state.tables.length + temporary.length) % spriteCounts.table);
    state.tables.push(temp);
    temporary.push(temp);
    spots.push(spot);
  }
  for (const temp of temporary) {
    const index = state.tables.indexOf(temp);
    if (index >= 0) state.tables.splice(index, 1);
  }
  return spots;
}

function addTable() {
  if (state.mode !== "setup") return;
  const spots = findTableSpots();
  if (!spots.length) {
    flash("暫時找不到可放新餐桌的位置。");
    return;
  }
  if (state.cash < TABLE_COST) {
    flash(`現金不足，購買餐桌需要 $${TABLE_COST}。`);
    return;
  }
  showTablePurchasePopup(spots);
}

function confirmTablePurchase() {
  if (state.mode !== "setup" || !pendingTableSpots.length) {
    hideTablePurchasePopup();
    return;
  }
  const maxQty = Math.min(pendingTableSpots.length, Math.floor(state.cash / TABLE_COST));
  const quantity = Math.max(1, Math.min(maxQty, Math.floor(Number(ui.tablePurchaseQty.value) || 1)));
  if (quantity <= 0 || state.cash < TABLE_COST) {
    flash(`現金不足，購買餐桌需要 $${TABLE_COST}。`);
    hideTablePurchasePopup();
    return;
  }
  let lastItem = null;
  let purchased = 0;
  for (let i = 0; i < quantity; i += 1) {
    const spot = findTableSpot();
    if (!spot) break;
    spendCash(TABLE_COST);
    const item = makePlaced("table", spot.x, spot.y, state.tables.length % spriteCounts.table);
    state.tables.push(item);
    lastItem = item;
    purchased += 1;
  }
  selectedObject = lastItem;
  if (lastItem) debugInfo.lastPlaced = `餐桌 @ ${lastItem.gridX},${lastItem.gridY}`;
  hideTablePurchasePopup();
  flash(`已購買 ${purchased} 張餐桌，共 $${purchased * TABLE_COST}。`);
}

function deleteSelectedTable() {
  if (state.mode !== "setup" || !selectedObject) return;
  if (selectedObject.type !== "table") {
    flash("請先選取要刪除的餐桌。");
    return;
  }
  const index = state.tables.indexOf(selectedObject);
  if (index >= 0) {
    state.tables.splice(index, 1);
    selectedObject = null;
    pointerDrag = null;
    flash("已刪除選取餐桌。");
  }
}

function pointerDown(evt) {
  const point = canvasPoint(evt);
  const popupAnchor = popupPoint(evt);
  if (state.mode !== "setup") {
    const customer = customerAt(point.x, point.y);
    if (customer) {
      openCustomerPopup(customer, popupAnchor);
      return;
    }
    const waiter = waiterAt(point.x, point.y);
    if (waiter) {
      openStaffPopup(waiter, popupAnchor);
      return;
    }
    const kitchen = kitchenAt(point.x, point.y);
    if (kitchen) openKitchenPopup(kitchen, popupAnchor);
    return;
  }
  const hit = objectAt(point.x, point.y);
  if (hit) {
    selectedObject = hit;
    pointerDrag = { item: hit, moved: false, start: pixelToCell(point.x, point.y), offsetX: point.x - hit.x, offsetY: point.y - hit.y, centerOnCursor: hit.type === "kitchen" };
    canvas.setPointerCapture(evt.pointerId);
    return;
  }
  selectedObject = null;
  pointerDrag = null;
}

function pointerMove(evt) {
  if (state.mode !== "setup" || !pointerDrag) return;
  const point = canvasPoint(evt);
  const cell = pixelToCell(point.x, point.y);
  if (cell.x !== pointerDrag.start.x || cell.y !== pointerDrag.start.y) pointerDrag.moved = true;
  if (!pointerDrag.item) return;
  const targetCell = pointerDrag.centerOnCursor
    ? pixelToCenteredCell(pointerDrag.item, point.x, point.y)
    : pixelToCell(point.x - pointerDrag.offsetX, point.y - pointerDrag.offsetY);
  movePlaced(pointerDrag.item, targetCell);
}

function pointerUp(evt) {
  if (state.mode !== "setup" || !pointerDrag) return;
  pointerDrag = null;
  if (canvas.hasPointerCapture(evt.pointerId)) canvas.releasePointerCapture(evt.pointerId);
}

ui.open.addEventListener("click", openRestaurant);
ui.continue.addEventListener("click", startNextDay);
ui.resultContinue.addEventListener("click", hideResultPopup);
ui.restart.addEventListener("click", resetGame);
ui.addTable.addEventListener("click", addTable);
ui.deleteTable.addEventListener("click", deleteSelectedTable);
ui.menuButton.addEventListener("click", () => {
  if (state.mode !== "setup") return;
  fillMenuInputs();
  ui.recruit.hidden = true;
  ui.menu.hidden = false;
});
ui.menuClose.addEventListener("click", () => {
  syncMenuFromInputs();
  ui.menu.hidden = true;
});
ui.menuConfirm.addEventListener("click", () => {
  syncMenuFromInputs();
  ui.menu.hidden = true;
  flash("今日菜單已確認。");
});
ui.tablePurchaseConfirm.addEventListener("click", confirmTablePurchase);
ui.tablePurchaseCancel.addEventListener("click", hideTablePurchasePopup);
ui.tablePurchaseQty.addEventListener("input", () => {
  const max = Math.max(1, Number(ui.tablePurchaseQty.max) || 1);
  const value = Math.max(1, Math.min(max, Math.floor(Number(ui.tablePurchaseQty.value) || 1)));
  ui.tablePurchaseQty.value = String(value);
});
ui.recruitButton.addEventListener("click", () => {
  if (state.mode !== "setup") return;
  renderRecruitPanel();
  ui.menu.hidden = true;
  ui.recruit.hidden = false;
});
ui.recruitClose.addEventListener("click", () => {
  ui.recruit.hidden = true;
});
ui.unlockClose.addEventListener("click", () => {
  ui.unlockPopup.hidden = true;
});
ui.recruit.addEventListener("click", event => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;
  if (button.dataset.action === "hire") hireStaff(button.dataset.id);
  if (button.dataset.action === "fire") fireStaff(button.dataset.id);
});
ui.menu.addEventListener("input", event => {
  const row = event.target.closest(".menu-row");
  if (!row) return;
  const costInput = row.querySelector('[data-field="cost"]');
  const stockInput = row.querySelector('[data-field="stock"]');
  const keyName = row.dataset.food;
  const cost = Number(costInput.value) || FOOD_ITEMS[keyName]?.baseCost || 0;
  if (state.menu[keyName]) {
    state.menu[keyName].cost = cost;
    state.menu[keyName].price = cost * 2;
    state.menu[keyName].taste = tasteForCost(keyName, cost);
    state.menu[keyName].stock = Math.max(0, Math.floor(Number(stockInput.value) || 0));
    state.menu[keyName].plannedStock = Math.max(0, Math.floor(Number(stockInput.value) || 0));
  }
  row.querySelector('[data-field="costValue"]').textContent = `$${cost}`;
  row.querySelector('[data-field="price"]').textContent = `$${cost * 2}`;
  row.querySelector('[data-field="rating"]').textContent = state.menu[keyName]?.totalRating || 0;
});
ui.speed.addEventListener("click", () => {
  speed = speed === 1 ? 2 : speed === 2 ? 4 : 1;
  ui.speed.textContent = `${speed === 1 ? 2 : speed === 2 ? 4 : 1}x`;
  flash(`速度：${speed}x`);
});
ui.pause.addEventListener("click", () => {
  paused = !paused;
  ui.pause.textContent = paused ? "繼續" : "暫停";
  flash(paused ? "遊戲已暫停。" : "遊戲繼續。");
});
ui.reset.addEventListener("click", resetGame);
canvas.addEventListener("pointerdown", pointerDown);
canvas.addEventListener("pointermove", pointerMove);
canvas.addEventListener("pointerup", pointerUp);
canvas.addEventListener("pointercancel", () => {
  pointerDrag = null;
});
window.addEventListener("keydown", event => {
  if ((event.key === "Delete" || event.key === "Backspace") && state.mode === "setup" && selectedObject) {
    event.preventDefault();
    deleteSelectedTable();
  }
});

async function loadSprites() {
  const sprites = {};
  for (const [type, count] of Object.entries(spriteCounts)) {
    sprites[type] = await Promise.all(
      Array.from({ length: count }, (_, i) => loadImage(`assets/sprites/${type}-${i}.png?v=6`).catch(() => null))
    );
  }
  return sprites;
}

resetGame();
requestAnimationFrame(loop);

Promise.all([
  loadImage("assets/restaurant-map.png?v=5").catch(() => null),
  loadImage("assets/restaurant-atlas.png?v=5").catch(() => null),
  loadSprites().catch(() => ({})),
  loadImage("assets/sprites/table-single.png?v=1").catch(() => null),
  loadImage("assets/sprites/waiter-walk-sheet.png?v=1").catch(() => null),
  loadImage("assets/sprites/customer-walk-sheet.png?v=1").catch(() => null),
  loadImage("assets/sprites/customer-walk-female-sheet.png?v=1").catch(() => null),
  loadImage("assets/generated_customer_walk/customer-sit.png?v=1").catch(() => null),
  loadImage("assets/generated_customer_female_walk/customer-female-sit.png?v=1").catch(() => null)
]).then(([map, atlas, sprites, tableSingle, waiterWalk, customerWalk, customerWalkFemale, customerSit, customerFemaleSit]) => {
  assets = { map, atlas, sprites, tableSingle, waiterWalk, customerWalks: [customerWalk, customerWalkFemale].filter(Boolean), customerSit, customerFemaleSit };
});
