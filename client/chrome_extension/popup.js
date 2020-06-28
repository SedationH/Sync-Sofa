const requestbutton = document.getElementById("requestbutton");
const startbutton = document.getElementById("startbutton");
const stopbutton = document.getElementById("stopbutton");
const inputbox = document.getElementById("inputbox");
const footerbuttons = document.getElementById("footerbuttons");
const cancelbutton = document.getElementById("cancelbutton");
//const mtctbutton = document.getElementById("mtctbutton");

const PAUSECODE = "-5";
const PLAYCODE = "-4";
const HELLOCODE = "-3";
const CLOSEDCODE = "-1";
const DISCONNECTCODE = "-2";
const STATUSSTART = "start"
const STATUSEND = "end"
const STATUSCONNECT = "connect"
const STATUSSYNC = "sync"
const STATUSASK = "ask"
var apihost = "app.ylwang.me"

console.log(apihost);
chrome.storage.local.get(['apihost'], function(result) {
    if(result.key != null && result.key != "app.ylwang.me"){
        apihost = result.key;
        console.log(2, apihost);
    };
  });
console.log(apihost);

const params = {
    active: true,
    currentWindow: true
}

var status = "end"
var defaultHost = ""
var selfID = ""

requestbutton.addEventListener("click", e => {
    e.preventDefault();
    UIStatusToLinked();
    handleCreateHostSession(e);
})

startbutton.addEventListener("click", e => {
    e.preventDefault();
    UIStatusToLinked();
    handleBeginSessions(e)
})

inputbox.addEventListener("click", e => {
    e.preventDefault();
    if (requestbutton.style.display === "block") {
        requestbutton.style.display = "none";
        cancelbutton.style.display = "block";
    }
})

stopbutton.addEventListener("click", e => {
    e.preventDefault();
    sentMsgToContent(STATUSEND)
    UIStatusToInit();
    if (inputbox.value !== "") {
        inputbox.value = "";
    }
})

cancelbutton.addEventListener("click", e => {
    e.preventDefault();
    UIStatusToInit();
    if (inputbox.value !== "") {
        inputbox.value = "";
    }
})

// mtctbutton.addEventListener("click", e => {
//     e.preventDefault();
//     chrome.windows.create({ 'url': 'chrome-extension://ocfjeogljngknapodpfhjpdidbddjaik/chatpopup.html', 'type': 'popup' }, function (window) { });
// })

function handleCreateHostSession(e) {
    e.preventDefault();
    let url = `https://${apihost}/v1/session`
    fetch(url, {
        method: 'GET',
    }).then(res => {
        if (res.status < 300) {
            return res.json();
        }
        return res.text();
    }).then(data => {
        sessionPair = JSON.parse(JSON.stringify(data));
        if (sessionPair != null) {
            inputbox.value = sessionPair.selfID;
        }
        chrome.storage.local.set({ "selfID": sessionPair.selfID }, function () { });
        sentMsgToContent(STATUSSTART, sessionPair.selfID);
        inputbox.select();
        document.execCommand("copy");
        UIStatusToLinked();
        setTimeout(function () {
            window.close();
        }, 3000);
    })
}

function handleResponse(response) {
    if (response.status == STATUSASK) {
        if (response.body == STATUSEND) {
            UIStatusToInit();
        }
        if (response.body == STATUSCONNECT) {
            UIStatusToLinked();
        }
        if (response.body == STATUSSYNC) {
            UIStatusToLinked();
        }
    }
}
function sentMsgToContent(status, body = "", message = {}) {
    chrome.tabs.query(params, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id,
            { "status": status, "body": body, "message": message }, function (response) {
                handleResponse(response);
            });
    });
}

function handleBeginSessions(e) {
    e.preventDefault();
    let url = `https://${apihost}/v1/session/?id=${inputbox.value}`
    fetch(url, {
        method: 'GET',
    }).then(res => {
        if (res.status < 300) {
            return res.json();
        }
        return res.text();
    }).then(data => {
        sessionPair = JSON.parse(JSON.stringify(data));
        if (sessionPair != null) {
            inputbox.value = sessionPair.selfID;
        }
        sentMsgToContent(STATUSSTART, sessionPair.selfID, { "beginFlag": true });
        UIStatusToLinked();
        setTimeout(function () {
            window.close();
        }, 3000);
    })
}


function UIStatusToLinked() {
    startbutton.style.display = "none";
    requestbutton.style.display = "none";
    stopbutton.style.display = "block";
    // mtctbutton.style.display = "block";
}

function UIStatusToInit() {
    selfID = "";
    inputbox.value = selfID;
    startbutton.style.display = "block";
    requestbutton.style.display = "block";
    stopbutton.style.display = "none";
    cancelbutton.style.display = "none";
    // mtctbutton.style.display = "none";
}

function initialize() {
    chrome.storage.local.get(['selfID'], function (result) {
        if (result.selfID != undefined) {
            selfID = result.selfID;
            inputbox.value = selfID;
            requestbutton.value = "REQUEST NEW CODE";
            stopbutton.style.display = "none";
            //mtctbutton.style.display = "none";
            cancelbutton.style.display = "none";
        }
    });
    sentMsgToContent(STATUSASK);
}
initialize();