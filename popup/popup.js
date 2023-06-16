const button = document.getElementById('11');
const textSudir = document.getElementById('22');
const textTech = document.getElementById('33');
const startStop = document.getElementById('44');

let started = 'on';

button.addEventListener('click', updateButton);
startStop.addEventListener('click', startStopFunc);

window.onload = function() {
  initConfigurationPage();
};

function initConfigurationPage() {
  loadFromBrowserStorage(['started', 'login_sudir', 'tech_login'], function (result) {
    if (result.login_sudir) textSudir.value = result.login_sudir;
    if (result.tech_login) textTech.value = result.tech_login;

    started = result.started;
    if (started==="on") startStop.style = "color: green";
    else startStop.style = "color: red";
  });
}

function loadFromBrowserStorage(item,callback_function) {
  chrome.storage.local.get(item, callback_function);
}

function storeInBrowserStorage(item, callback_function) {
  chrome.storage.local.set(item, callback_function);
}

function create_configuration_data(headerValue) {
  let headers = [];

  headers.push({
    "url_contains":"",
    "action":"add",
    "header_name":"x-dsm-auth",
    "header_value":headerValue,
    "comment":"",
    "apply_on":"req",
    "status":"on"}
  );

  let to_export = {
    "format_version":"1.2",
    "target_page":"",
    "headers":headers,
      "debug_mode":false,
      "show_comments":true,
      "use_url_contains":false
  };

  return JSON.stringify(to_export);
}

async function updateButton() {
  chrome.runtime.sendMessage("on");
  await saveData();
  storeInBrowserStorage({started:'on'},function() {
    chrome.runtime.sendMessage("on");
    started = "on";
  });
}

async function saveData() {
  storeInBrowserStorage({login_sudir: textSudir.value, tech_login: textTech.value});
  const token = await fetch(`http://localhost:5555/token?login_sudir=${textSudir.value}&tech_login=${textTech.value}`)
  .then(res => res.text())
  .then(res => {
    if(res) {
      textSudir.style = "border-color: green";
    } else {
      textSudir.style = "border-color: red";
    }

    return res;
  })
  .catch(err => {
    textSudir.style = "border-color: red";
  });

  storeInBrowserStorage({config:create_configuration_data(token)},function() {
    chrome.runtime.sendMessage("reload");
  });

  return true;
}

async function startStopFunc() {
  if (started==="off") {
    await saveData();
    storeInBrowserStorage({started:'on'},function() {
      chrome.runtime.sendMessage("on");
      started = "on";
      startStop.style = "color: green";
    });
  }
  else {
    storeInBrowserStorage({started:'off'},function() {
      chrome.runtime.sendMessage("off");
      started = "off";
      startStop.style = "color: red";
    });
  }
}