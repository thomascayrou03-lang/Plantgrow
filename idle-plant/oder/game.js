// Game state
let coins = 0;
let gameSpeed = 1000; // milliseconds
let selectedPot = null;
let globalGrowthRate = 1;
let autoHarvest = false;

// Garden state
let pots = [
  { unlocked: true, plant: null },
  { unlocked: false, plant: null },
  { unlocked: false, plant: null },
  { unlocked: false, plant: null },
  { unlocked: false, plant: null },
  { unlocked: false, plant: null },
  { unlocked: false, plant: null },
  { unlocked: false, plant: null },
  { unlocked: false, plant: null }
];

// Plant stages configuration
const plantStages = {
  1: { name: "Graine", growthTime: 5000, production: 0 },
  2: { name: "Jeune pousse", growthTime: 10000, production: 1 },
  3: { name: "Plante mature", growthTime: 15000, production: 2 },
  4: { name: "Plante florissante", growthTime: 20000, production: 5 }
};

// Initialize game
document.addEventListener('DOMContentLoaded', function() {
  updateCoins();
  renderGarden();
  startGameLoop();
});

// Game loop
function startGameLoop() {
  setInterval(() => {
    growPlants();
    produceCoins();
    renderGarden();
  }, gameSpeed);
}

// Plant growth logic
function growPlants() {
  pots.forEach(pot => {
    if (pot.plant && pot.plant.water > 0) {
      const now = Date.now();
      const plant = pot.plant;
      
      // Grow plant if enough time has passed
      if (now - plant.lastGrow > plantStages[plant.stage].growthTime / globalGrowthRate) {
        if (plant.stage < 4) {
          plant.stage++;
          plant.lastGrow = now;
        }
        plant.water--;
      }
    }
  });
}

// Coin production
function produceCoins() {
  let totalProduction = 0;
  
  pots.forEach(pot => {
    if (pot.plant && pot.plant.stage >= 2) {
      totalProduction += plantStages[pot.plant.stage].production;
    }
  });
  
  coins += totalProduction;
  updateCoins();
}

// UI Updates
function updateCoins() {
  document.getElementById('coinCount').textContent = Math.floor(coins);
}

function renderGarden() {
  const garden = document.getElementById("garden");
  garden.innerHTML = "";
  
  pots.forEach((pot, index) => {
    const slot = document.createElement("div");
    slot.className = "pot-slot";
    
    // Pot image
    const potImg = document.createElement("img");
    potImg.className = "pot-img";
    
    if (pot.unlocked) {
      potImg.src = "../img/pot1.png";
      potImg.onclick = () => selectPot(index);
    } else {
      potImg.src = "../img/emplacement.png";
      potImg.className += " locked";
      potImg.onclick = () => buyPotSlot(index);
    }
    
    slot.appendChild(potImg);
    
    // Plant
    if (pot.unlocked && pot.plant) {
      const plantImg = document.createElement("img");
      plantImg.className = "plant-img";
      plantImg.src = `../img/stage a${pot.plant.stage}.png`;
      plantImg.onclick = () => showPlantDetails(index);
      slot.appendChild(plantImg);
      
      // Growth progress bar
      if (pot.plant.stage < 4) {
        const progressBar = document.createElement("div");
        progressBar.className = "progress-bar";
        
        const progress = document.createElement("div");
        progress.className = "progress";
        
        const now = Date.now();
        const elapsed = now - pot.plant.lastGrow;
        const totalTime = plantStages[pot.plant.stage + 1].growthTime / globalGrowthRate;
        const percent = Math.min(100, (elapsed / totalTime) * 100);
        
        progress.style.width = `${percent}%`;
        progressBar.appendChild(progress);
        slot.appendChild(progressBar);
      }
    }
    
    // Plant seed button
    if (pot.unlocked && !pot.plant) {
      const plantBtn = document.createElement("button");
      plantBtn.className = "plant-btn";
      plantBtn.textContent = "🌱";
      plantBtn.onclick = () => plantSeedInPot(index);
      slot.appendChild(plantBtn);
    }
    
    garden.appendChild(slot);
  });
}

// Game actions
function selectPot(index) {
  selectedPot = index;
}

function plantSeedInPot(index) {
  if (selectedPot !== index) selectPot(index);
  
  const pot = pots[index];
  if (!pot.unlocked || pot.plant) return;
  
  pot.plant = {
    stage: 1,
    water: 0,
    lastGrow: Date.now()
  };
  
  renderGarden();
}

function plantSeed() {
  if (selectedPot === null) {
    alert("Veuillez sélectionner un pot !");
    return;
  }
  
  plantSeedInPot(selectedPot);
}

function waterPlants() {
  let wateredCount = 0;
  
  pots.forEach(pot => {
    if (pot.plant) {
      pot.plant.water += 1;
      wateredCount++;
    }
  });
  
  if (wateredCount > 0) {
    renderGarden();
  } else {
    alert("Aucune plante à arroser !");
  }
}

function harvestAll() {
  let harvestedCoins = 0;
  
  pots.forEach(pot => {
    if (pot.plant && pot.plant.stage >= 2) {
      harvestedCoins += pot.plant.stage * 2;
      pot.plant.water = Math.max(0, pot.plant.water - 1);
    }
  });
  
  if (harvestedCoins > 0) {
    coins += harvestedCoins;
    updateCoins();
    renderGarden();
    alert(`Vous avez récolté ${harvestedCoins} coins !`);
  } else {
    alert("Rien à récolter pour le moment.");
  }
}

// Shop functions
function buyPotSlot(index) {
  if (coins >= 50) {
    coins -= 50;
    pots[index].unlocked = true;
    updateCoins();
    renderGarden();
  } else {
    alert("Pas assez de coins !");
  }
}

function buyPot() {
  // Find first locked pot
  const lockedPotIndex = pots.findIndex(pot => !pot.unlocked);
  
  if (lockedPotIndex === -1) {
    alert("Tous les emplacements sont débloqués !");
    return;
  }
  
  if (coins >= 50) {
    coins -= 50;
    pots[lockedPotIndex].unlocked = true;
    updateCoins();
    renderGarden();
  } else {
    alert("Pas assez de coins ! (Coût: 50)");
  }
}

function buyUpgrade() {
  if (coins >= 100) {
    coins -= 100;
    globalGrowthRate *= 1.5;
    updateCoins();
    alert("Vitesse de croissance augmentée !");
  } else {
    alert("Pas assez de coins ! (Coût: 100)");
  }
}

// Plant panel functions
function showPlantDetails(index) {
  selectPot(index);
  const plant = pots[index].plant;
  
  if (plant) {
    document.getElementById('pHeight').textContent = plant.stage * 10;
    document.getElementById('pWater').textContent = plant.water;
    document.getElementById('pProduction').textContent = plantStages[plant.stage].production;
    document.getElementById('plantPanel').classList.add('open');
  }
}

function closePanel() {
  document.getElementById('plantPanel').classList.remove('open');
}

// Auto-save (simplified)
function saveGame() {
  const gameState = {
    coins: coins,
    pots: pots,
    globalGrowthRate: globalGrowthRate
  };
  localStorage.setItem('oderGameSave', JSON.stringify(gameState));
}

function loadGame() {
  const save = localStorage.getItem('oderGameSave');
  if (save) {
    const gameState = JSON.parse(save);
    coins = gameState.coins || 0;
    pots = gameState.pots || pots;
    globalGrowthRate = gameState.globalGrowthRate || 1;
    updateCoins();
    renderGarden();
  }
}

// Load game on start
window.addEventListener('load', loadGame);

// Save game periodically
setInterval(saveGame, 30000); // Save every 30 seconds