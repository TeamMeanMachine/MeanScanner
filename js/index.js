// Get user base data from wherever
let userBase = [
  {
    name: "Aidan Linerud",
    totalHours: 42,
    sinceAction: 60,
    history: [
      { time: "7/27/20 18:30", action: "in" },
      { time: "7/20/20 21:00", action: "out" },
      { time: "7/20/20 18:40", action: "in" },
    ],
  },
];
// Current user's info, copied straight from userBase
let userInfo = undefined;

// DOM variables
let loginDiv = document.getElementById("login");
let nameInput = document.getElementById("username");
let deniedText = document.getElementById("denied-text");

let mainDiv = document.getElementById("main");
let grantedText = document.getElementById("granted-text");
let nameText = document.getElementById("name-text");
let hoursText = document.getElementById("hours-text");
let checkedText = document.getElementById("checked-text");
let timeText = document.getElementById("time-text");
let toggleCheckText = document.getElementById("toggle-check-text");
let historyList = document.getElementById("history-list");

// Load info from user base if they've already logged in
if (localStorage.getItem("user")) {
  userInfo = userBase.find(user => user.name == localStorage.getItem("user"));
  setupUI();
}

// Arranges and fills in UI elements
function setupUI() {
  loginDiv.style.display = "none";
  mainDiv.style.display = "block";
  nameText.innerHTML = userInfo.name;
  hoursText.innerHTML = userInfo.totalHours;
  checkedText.innerHTML = userInfo.history[0].action;
  timeText.innerHTML = userInfo.sinceAction;
  toggleCheckText.innerHTML = checkedText.innerHTML == "in" ? "out" : "in";
  historyList.innerHTML = "";
  userInfo.history.forEach(elm => {
    historyList.innerHTML += `<li>${elm.time} - checked ${elm.action}</li>`;
  });
  nameInput.value = "";
}

// Self-explanatory
function login() {
  if (!nameInput.value) return;
  userBase.forEach(user => {
    if (user.name == nameInput.value) {
      userInfo = JSON.parse(JSON.stringify(user));
      setupUI();
      grantedText.style.display = "block";
      localStorage.setItem("user", user.name);
      return;
    }
  });
  if (!userInfo) {
    deniedText.style.display = "block";
  }
}

// Reset everything
function logout() {
  userInfo = undefined;
  nameText.innerHTML = "";
  hoursText.innerHTML = "";
  checkedText.innerHTML = "";
  timeText.innerHTML = "";
  toggleCheckText.innerHTML = "";
  historyList.innerHTML = "";
  loginDiv.style.removeProperty("display");
  mainDiv.style.removeProperty("display");
  grantedText.style.removeProperty("display");
  deniedText.style.removeProperty("display");
  localStorage.removeItem("user");
}

const qr = new QRScanner({
  canvas: '#canvas',
  draw: {
    lineWidth: 2,
    strokeStyle: 'red',
  },
});

async function scan() {
  const data = await qr.scan();
  document.querySelector('#username').value = data.name;
}