/* true to active cheats */
const debugMode = false;

/* Total Diamonds */
let score = 0;
/* Diamonds per Second */
let dps = 0.0;
/* Diamonds per Click */
let dpc = 1.0;
/* Upgrade purchase amount */
let upgradeBuy = 1;
/* BG index */
let bgIndex = 0;
/* Sound on/off */
let soundOn = false;
/* Music */
let music = new Audio("audio/mad_robots.mp3");
music.volume = 0.32;
music.addEventListener("ended", function() {
  music.currentTime = 0;
  music.play();
}, false);
/* Buy Upgrade SFX */
let upgradeSFX = new Audio("audio/buy_upgrade.mp3");
upgradeSFX.volume = 0.5;
/* Click Diamond SFX */
let clickSFX = new Audio("audio/clink.mp3");
clickSFX.volume = 0.1;

/* Upgrade array */
const UPGRADES_COUNT = 9;
let upgrades = [UPGRADES_COUNT];

/* DOM elements */
let gameWindow;
let clicker;
let scoreTxt;
let perClickTxt;
let perSecText;
let upgradeCont;
let soundBtn;

/* Upgrade class */
let Upgrade = class{
  constructor(index, name, price, priceMult, dpc, dps, img) {
    this.index = index;
    this.name = name;
    this.price = price;
    this.priceMult = priceMult;
    this.dpc = dpc;
    this.dps = dps;
    this.count = 0;
    this.canBuy = false;
    this.unlocked = false;
    // Create node
    this.node = document.createElement("div");
    this.node.classList.add("upgrade");
    this.node.classList.add("unlocked");
    if(!debugMode) {
      this.node.style.visibility = "hidden";
    }
    this.node.id = name;
    // Create name container
    this.nameCont = document.createElement("div");
    this.nameCont.classList.add("upgrade-name");
    this.nameCont.classList.add("centered");
    this.nameCont.textContent = name;
    this.node.appendChild(this.nameCont);
    // Create image container
    this.imgCont = document.createElement("img");
    this.imgCont.src = img;
    this.imgCont.classList.add("upgrade-img");   this.imgCont.classList.add("centered");
    this.node.appendChild(this.imgCont);
    // Create count container
    this.countCont = document.createElement("div");
    this.countCont.classList.add("upgrade-count");
    this.countCont.classList.add("centered");
    this.countCont.textContent = "x" + this.count;
    this.node.appendChild(this.countCont);
    // Create cost container
    this.costCont = document.createElement("btn");
    this.costCont.classList.add("upgrade-cost");
    this.costCont.classList.add("centered");
    this.costCont.classList.add("locked");
    this.costCont.textContent = "💎" + this.price;
    this.node.appendChild(this.costCont);
  }
};

Upgrade.prototype.setHidden = function(isHidden) {
  if(isHidden) {
    this.node.style.visibility = "hidden";
    this.node.style.display = "none";
  } else {
    this.node.style.visibility = "visible";
    this.node.style.display = "grid";
    // update background when this upgrade is unlocked
    if(!this.unlocked) {
      updateBackground(this.index);
      this.unlocked = true;
    }
  }
  return this;
}

Upgrade.prototype.setCanBuy = function(canBuy) {
  if(this.canBuy != canBuy) {
    this.canBuy = canBuy;
    if(canBuy) {
      this.costCont.classList.add("unlocked");
      this.costCont.classList.remove("locked");
    } else {
      this.costCont.classList.add("locked");
      this.costCont.classList.remove("unlocked");
    }
  }
  return this;
}

Upgrade.prototype.buy = function() {
    if(score >= this.price * upgradeBuy) {
      // Play sound
      if(soundOn) {
        upgradeSFX.play();
        upgradeSFX.currentTime = 0;
      }
      // Add dpc and dps
      addPerClick(this.dpc * upgradeBuy);
      addPerSec(this.dps * upgradeBuy);
      // Increase count
      this.count += upgradeBuy;
      this.updateDisplayCount();
      // Increase price
      let oldPrice = this.price;
      for(let i = 0; i < upgradeBuy; i++) {
        this.price = Math.round(this.price * this.priceMult);
      }
      this.updateDisplayPrice();
      // Remove points
      add(-oldPrice * upgradeBuy);
      // Create particle
      Particle.create(this.countCont, "+" + upgradeBuy, 1000);
      // Show the next upgrade, if possible
      if(this.index < UPGRADES_COUNT - 1) {
        upgrades[this.index + 1].setHidden(false);
      }
    }
    return this;
}

Upgrade.prototype.updateDisplayCount = function() {
  this.countCont.textContent = "x" + this.count;
}

Upgrade.prototype.updateDisplayPrice = function() {
  this.costCont.textContent = "💎" + this.price * upgradeBuy;
}

/* End Upgrade class */

/* Particle class */
let Particle = class {
  constructor(parent, txt) {
    this.parent = parent;
    this.txt = txt;
    // Create node
    this.node = document.createElement("span");
    this.node.classList.add("particle");
    this.node.classList.add("centered");
    this.node.textContent = txt;
    this.node.style.zIndex = 100;
    this.parent.appendChild(this.node);
  }
};

Particle.create = function(parent, txt, life) {
  // Create a particle and schedule events
  let p = new Particle(parent, txt);
  // Schedule fade-out
  setTimeout(function() { 
    p.node.classList.add("fade-up"); 
    p.node.style.marginLeft = (p.node.parentNode.style.width - p.node.style.width + Math.random() * 20) + "px";
  }, Math.min(life, 10));
  // Schedule removal
  setTimeout(function() { p.destroy(p); }, life);
}

Particle.prototype.destroy = function(p) {
  this.node.parentNode.removeChild(this.node);
}

/* End Particle class */

// Function called on body load
let start = function(event) {
  console.log("loading game...");
  // init 
  gameWindow = document.getElementById("main");
  clicker = document.getElementById("clicker");
  scoreTxt = document.querySelector("#stats-container p");
  perClickTxt = document.querySelector("#per-click-container p");
  perSecTxt = document.querySelector("#per-sec-container p");
  upgradeCont = document.getElementById("upgrade-container");
  soundBtn = document.getElementById("sound-btn");
  if(gameWindow != null) {
    console.log("loaded game");
    
    // initialize upgrades
    initUpgrades();
    
    // load previous session (if any)
    load();
    
    // schedule Diamonds Per Second
    setInterval(function() {
      if(dps > 0) {
        add(dps / 10);
      }
    }, 100);
    setInterval(function() {
      if(dps > 0) {
        Particle.create(clicker, "💎" + dps, 1000);
      }
    }, 1000);
    
    // animate clicker
    setInterval(function() {
      let mTop = Math.round(Math.cos(Date.now()*0.004)*5)+40;
      clicker.style.marginTop = mTop + "px";
    },24);
    
    // cheats
    if(debugMode) {
      window.addEventListener("keydown", function() {
        add(1000);
      });
    }

  } else {
    alert("There was a problem loading clicker.js :(");
  }
  
}

/* Creates all upgrade objects */
let initUpgrades = function() {
  // create all upgrades
  // upgrade constructor: (index, name, price, priceMult, dpc, dps, img)
  let shovel = new Upgrade(0, "Shovel", 25, 1.1, 1, 0, "img/shovel.png");
  shovel.setHidden(false);
  addUpgrade(shovel);
  addUpgrade(new Upgrade(1, "Pickaxe", 100, 1.1, 1, 1, "img/pickaxe.png"));
  addUpgrade(new Upgrade(2, "Jackhammer", 500, 1.15, 3, 5, "img/jackhammer.png"));
  addUpgrade(new Upgrade(3, "Mega Drill", 5_000, 1.2, 9, 10, "img/mega-drill.png"));
  addUpgrade(new Upgrade(4, "Laser Drill", 20_000, 1.2, 15, 20, "img/laser-drill.png"));
  addUpgrade(new Upgrade(5, "TNT Drill", 100_000, 1.2, 50, 5, "img/tnt-drill.png"));
  addUpgrade(new Upgrade(6, "Mine", 250_000, 1.25, 25, 38, "img/mine.png"));
  addUpgrade(new Upgrade(7, "Undersea Mine", 700_000, 1.25, 25, 50, "img/sea-mine.png"));
  addUpgrade(new Upgrade(8, "Space Mine", 1_000_000, 1.25, 40, 100, "img/space-mine.png"));
  let earth = new Upgrade(9, "Earth", 1_000_000_000, 1.0, 0, 0, "img/earth.png");
  earth.node.addEventListener("click", function() {
    if(score >= earth.price * upgradeBuy) {
      updateBuyAmount(1);
      win(earth);
    }
  });
  addUpgrade(earth);
}

/* Adds an upgrade to the upgrades array and to the window */
let addUpgrade = function(upg) {
  // Add buy function
  upg.node.addEventListener("click", function() { upg.buy(); });
  upgrades[upg.index] = upg;
  upgradeCont.appendChild(upg.node);
}

// Called when the diamond is clicked
let clickDiamond = function() {
  if(soundOn) {
    clickSFX.currentTime = 0;
    clickSFX.play();
  }
  add(dpc); 
  Particle.create(clicker, "💎" + dpc, 1000);
}

let add = function(amnt) {
  // upgrade score
  score += amnt;
  updateScore();
  updateUpgradePriceLocks();
}

let addPerClick = function(amnt) { setPerClick(dpc + amnt) }

let setPerClick = function(amnt) {
  dpc = amnt;
  perClickTxt.textContent = "💎" + amnt + " / click";
}

let addPerSec = function(amnt) { setPerSec(dps + amnt); }

let setPerSec = function(amnt) {
  dps = amnt;
  perSecTxt.textContent = "💎" + amnt + " / sec";
}

/* Updates the upgrade buy amount and refreshes all upgrades */
let updateBuyAmount = function(amnt) { 
  upgradeBuy = amnt;
  for(let i = 0; i < UPGRADES_COUNT; i++) {
    upgrades[i].updateDisplayPrice();
    upgrades[i].setCanBuy(score >= upgradeBuy * upgrades[i].price);
  }
}

/* Updates the text in the score */
let updateScore = function() {
  scoreTxt.textContent = "💎" + Math.round(score);
}

/* Updates which upgrades can be bought right now */
let updateUpgradePriceLocks = function() {
  for(let i = 0; i < UPGRADES_COUNT; i++) {
    upgrades[i].setCanBuy(score >= upgradeBuy * upgrades[i].price);
  }
}

/* Updates the background based on which upgrade was just unlocked */
let updateBackground = function(index) {
  bgIndex = index;
  if(index >= 9) {
    gameWindow.style.backgroundImage = "url('img/space.png')";
  } if(index >= 7) {
    gameWindow.style.backgroundImage = "url('img/factory.png')";
  } else if(index >= 4) {
    gameWindow.style.backgroundImage = "url('img/camp.png')";
  } else {
    gameWindow.style.backgroundImage = "url('img/cave.png')";
  }
}

let win = function(upg) {
  alert("Congrats! You bought the planet Earth and everyone on it. You win!");
  upg.node.classList.add("locked");
  upg.node.classList.remove("unlocked");
}

let toggleSound = function() {
  soundOn = !soundOn;
  if(soundOn) {
    // begin sound track
    music.play();
    soundBtn.textContent = "🔊";
  } else {
    music.pause();
    soundBtn.textContent = "🔇";
  }
}

/* Save progress to local storage */
let save = function() {
  // TO DO: save to local storage
  let saveUpg = [9];
  for(let i = 0; i < UPGRADES_COUNT; i++) {
    let u = upgrades[i];
    saveUpg[i] = {price: u.price, count: u.count, dpc: u.dpc, dps: u.dps, unlocked: u.unlocked};
  }
  console.log(saveUpg);
  localStorage.setItem("score", score);
  localStorage.setItem("upgrades", JSON.stringify(saveUpg));
  localStorage.setItem("bg", bgIndex);
}

/* Load progress from local storage */
let load = function() {
  setPerClick(1);
  setPerSec(0);
  if(localStorage.hasOwnProperty("upgrades")) {
    score = parseInt(localStorage.getItem("score"));
    let loadUpg = JSON.parse(localStorage.getItem("upgrades"));
    for(let i = 0; i < UPGRADES_COUNT; i++) {
      upgrades[i].price = loadUpg[i].price;
      upgrades[i].count = loadUpg[i].count;
      upgrades[i].dpc = loadUpg[i].dpc;
      upgrades[i].dps = loadUpg[i].dps;
      upgrades[i].unlocked = loadUpg[i].unlocked;
      upgrades[i].setHidden(!upgrades[i].unlocked);
      upgrades[i].updateDisplayCount();
      upgrades[i].updateDisplayPrice();
      addPerClick(upgrades[i].dpc * upgrades[i].count);
      addPerSec(upgrades[i].dps * upgrades[i].count);
    }
    updateBackground(parseInt(localStorage.getItem("bg")));
  }
  updateScore();
  updateUpgradePriceLocks();
}

let reset = function() {
  localStorage.clear();
  location.reload(false);
}

