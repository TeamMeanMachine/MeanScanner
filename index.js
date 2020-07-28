// Get user base data from wherever
let userBase = [
  {
    name: "Aidan Linerud",
    pass: "2471",
    totalHours: 42,
    sinceAction: 60,
    history: [
      { time: "7/27/20 18:30", action: "checked in" },
      { time: "7/20/20 21:00", action: "checked out" },
      { time: "7/20/20 18:40", action: "checked in" },
    ],
  },
];
// Current user's info, copied straight from userBase
let userInfo = undefined;

// DOM elements variables
let loginDiv = document.getElementById("login");
let nameInput = document.getElementById("username");
let passInput = document.getElementById("password");
let errorText = document.getElementById("error-text");

let mainDiv = document.getElementById("main");
let nameText = document.getElementById("name-text");
let hoursText = document.getElementById("hours-text");
let checkedText = document.getElementById("checked-text");
let timeText = document.getElementById("time-text");
let checkToggle = document.getElementById("toggle-check");
let historyList = document.getElementById("history-list");

// Self-explanatory
function login() {
  if (!nameInput.value) return;
  userBase.forEach(user => {
    if (user.name.toLowerCase() == nameInput.value.toLowerCase() && user.pass == passInput.value) {
      loginDiv.style.display = "none";
      mainDiv.style.display = "block";
      userInfo = JSON.parse(JSON.stringify(user));
      fillInfo();
      nameInput.value = "";
      passInput.value = "";
      errorText.style.display = "none";
      return;
    }
  });
  if (!userInfo) {
    errorText.style.display = "block";
  }
}

// Fills DOM elements with stuff
function fillInfo() {
  nameText.innerHTML = userInfo.name;
  hoursText.innerHTML = userInfo.totalHours;
  checkedText.innerHTML = userInfo.history[0].action;
  timeText.innerHTML = userInfo.sinceAction;
  checkToggle.innerHTML = checkedText.innerHTML == "checked in" ? "Check out" : "Check in";
  historyList.innerHTML = "";
  userInfo.history.forEach(elm => {
    historyList.innerHTML += `<li>${elm.time} - ${elm.action}</li>`;
  });
}

// Reset everything
function logout() {
  userInfo = undefined;
  nameText.innerHTML = "";
  hoursText.innerHTML = "";
  checkedText.innerHTML = "";
  timeText.innerHTML = "";
  checkToggle.innerHTML = "";
  historyList.innerHTML = "";
  loginDiv.style.display = "block";
  mainDiv.style.display = "none";
}
