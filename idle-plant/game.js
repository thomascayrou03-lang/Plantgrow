const garden = document.getElementById("garden");
console.log("garden =", garden);

let coins = 1000; // pour tester plus facilement
let selectedPot = 0;

/* =========================
   DONNÉES DU JARDIN
========================= */



let pots = Array.from({ length: 7 }, (_, i) => ({
  unlocked: i === 0,   // 1er pot gratuit
  plant: null          // { stage, water, height, lastGrow }
}));

function createPlant() {
  return {
    height: 0,
    water: 0
  };
}

function renderPots() {
  const garden = document.getElementById("garden");
  garden.innerHTML = "";

  pots.forEach((pot, index) => {
    const potDiv = document.createElement("div");
    potDiv.className = "pot-wrapper";

    // IMAGE POT OU EMPLACEMENT
    const potImg = document.createElement("img");

    if (!pot.unlocked) {
      potImg.src = "img/emplacement.png";
      potImg.onclick = () => {
        if (coins >= 50) {
          coins -= 50;
          pot.unlocked = true;
          updateCoins();
          renderPots();
        }
      };
    } else {
      potImg.src = "img/pot1.png";
    }

    potDiv.appendChild(potImg);

    // 🌱 PLANTE
    if (pot.plant) {
      const plantImg = document.createElement("img");
      plantImg.src = `img/stage a${pot.plant.stage}.png`;
      plantImg.className = "plant-img";

      // GAGNER DES PIÈCES EN CLIQUANT
      plantImg.onclick = () => {
        selectedPot = index;
        coins += pot.plant.stage;
        updateCoins();
      };

      potDiv.appendChild(plantImg);
    }

    // 🌱 PLANTER GRAINE (bouton vert)
    if (pot.unlocked && !pot.plant) {
      const plantBtn = document.createElement("button");
      plantBtn.textContent = "🌱";
      plantBtn.className = "plant-btn";
      plantBtn.onclick = () => plantSeed(index);
      potDiv.appendChild(plantBtn);
    }

    garden.appendChild(potDiv);
  });
}
function tryBuyPot(index) {
  if (coins < 500) {
    alert("❌ Pas assez de pièces (500 requises)");
    return;
  }

  const confirmBuy = confirm("Acheter cet emplacement pour 500 pièces ?");
  if (!confirmBuy) return;

  coins -= 500;
  pots[index].unlocked = true;
  renderGarden();
}

function plantSeed(index) {
  const pot = pots[index];
  if (!pot.unlocked || pot.plant) return;

  pot.plant = {
    stage: 1,          // stage a1
    water: 0,
    height: 0,
    lastGrow: Date.now()
  };

  renderPots();
}


function waterPlant() {
  if (selectedPot === null) return;

  const plant = pots[selectedPot].plant;
  if (!plant) return;

  plant.water += 1;
}

function deletePlant() {
  const pot = pots[selectedPot];
  if (!pot || !pot.plant) return;

  pot.plant = null;
  closePanel();
  renderGarden();
}

function openPanel(plant) {
  document.getElementById("pHeight").textContent = plant.height;
  document.getElementById("pWater").textContent = plant.water;
  document.getElementById("plantPanel").classList.add("open");
}

function closePanel() {
  document.getElementById("plantPanel").classList.remove("open");
}

renderGarden();

function plantSeed(potIndex) {
  const pot = pots[potIndex];

  if (!pot || pot.plant) return;

  pot.plant = {
    height: 5,
    stage: "stage a1"
  };

  renderGarden();
}

function renderGarden() {
  const garden = document.getElementById("garden");
  if (!garden) return;
garden.innerHTML = "";


  pots.forEach((pot, index) => {
    const slot = document.createElement("div");
    slot.className = "pot-slot";

    // IMAGE DU POT OU DE L'EMPLACEMENT
    const potImg = document.createElement("img");

    if (!pot.unlocked) {
      potImg.src = "img/emplacement.png";
      potImg.onclick = () => buyPot(index);
    } else {
      potImg.src = "img/pot1.png";
    }

    slot.appendChild(potImg);

    // PLANTE
    if (pot.plant) {
      const plantImg = document.createElement("img");

      plantImg.src = "img/" + pot.plant.stage + ".png";
      plantImg.className = "plant-img";

      plantImg.onclick = () => openPlantPanel(index);

      slot.appendChild(plantImg);
    }

    garden.appendChild(slot);
  });
}

function plantSeed() {
  const pot = pots[selectedPot];

  if (!pot.unlocked || pot.plant) return;

  pot.plant = {
    stage: "stage a1"
  };

  renderPots();
}


function buyPot(index) {
  if (coins < 500) {
    alert("Pas assez de pièces !");
    return;
  }

  coins -= 500;
  pots[index].unlocked = true;
  renderGarden();
}

setInterval(() => {
  pots.forEach(pot => {
    if (!pot.plant) return;

    const plant = pot.plant;
    const now = Date.now();

    // pousse toutes les 5 secondes si eau dispo
    if (plant.water > 0 && now - plant.lastGrow > 5000) {
      plant.height += 5;
      plant.water -= 1;
      plant.lastGrow = now;

      updateStage(plant);
      renderPots();
    }
  });
}, 1000);

function getPlantImage(stage) {
  return `img/stage a${stage}.png`;
}


function openPlantPanel(index) {
  selectedPot = index;
  // plus tard : panneau stats
}
renderGarden();
renderPots();

