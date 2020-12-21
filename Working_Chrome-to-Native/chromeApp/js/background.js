var hostName = "com.bcc.chrome.extension.native.communication";
var port = null;

//Startup Event
chrome.runtime.onInstalled.addListener(function() {
	console.log("OK");
});

// Bind event on receiving any message:
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
	switch(message.eventType) {
		case "signature":
			sendNativeMessage({
				"signXmlText": "OK",
				"signReason": "sign Reason",
				"signId": "sign Id"
			});

			var status = ["signed", "rejected"];
			var signedText = "OK";

			sendResponse({
				message: message,
				sender: sender,
				time : (new Date()).toUTCString() + "-" + (new Date()).getMilliseconds(),
				status: status,
				signedText: signedText
			});
			break;
		case "OtherString":
			// Functionality
			break;
		default:
			sendResponse({
				time: (new Date()).toUTCString(),
				sender: sender,
				status: "Invalid Request"
			});
			break;
	}
});

//////////////////////////////////////////////////////////////////////////////

function appendMessage(text) {
	console.log(text);
}

function onNativeMessage(message){
	appendMessage("Received message: <b>" + JSON.stringify(message) + "</b>");
	//port = null;	//Disconnect by self - try
}

function onDisconnected() {
	appendMessage("Failed to connect: " + chrome.runtime.lastError.message);
	port = null;
}

function connectNativeMessage() {
	if(port == null){
		port = chrome.runtime.connectNative(hostName);
		port.onMessage.addListener(onNativeMessage);
		port.onDisconnect.addListener(onDisconnected);
	}
	else
	{
		console.log("Already Connected");
	}
}

function disconnectNativeMessage() {
	try {
		chrome.runtime.reload();
	} catch (error) {
		console.log("kios mode enabled");
		chrome.runtime.restart();
	}
}

function sendNativeMessage(message) {
	connectNativeMessage();
	port.postMessage(message);
}