//https://stackoverflow.com/questions/31201420/chrome-extension-native-messaging-synchronization

//Locking implementation
var isLocked = false;
var lastNativeMessage = null;

//Startup Event
chrome.runtime.onInstalled.addListener(function() {
	console.log("BCC-CA Extention Loaded.");
});

// Bind event on receiving any message:
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
	if(isLocked)
	{
		return;
	}
	switch(message.eventType) {
		case "signature":
			isLocked = true;
			sendNativeMessage({
				"signXmlText": "OK",
				"signReason": "sign Reason",
				"signId": "sign Id"
			});
			var status = ["signed", "rejected"];
			// while(isLocked)
			// {
			// 	status = "nativeMessageSent";
			// }
			console.log(lastNativeMessage);
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

/////////////////////////////Native Message Function Defination - Start
var hostName = "com.bcc.chrome.extension.native.communication";
var port = null;

function onNativeMessage(message){
	//appendMessage("Received message: " + JSON.stringify(message));
	console.log(message);
	lastNativeMessage = message;
	port.disconnect();
	isLocked = false;
}

function onDisconnected() {
	console.warn("Faild to connect or disconnected");
	console.error(chrome.runtime.lastError.message);
	port = null;
}

function connectNativeMessage() {
	if(port != null){
		console.log("Not First Connection");
	}
	port = chrome.runtime.connectNative(hostName);
	port.onMessage.addListener(onNativeMessage);
	port.onDisconnect.addListener(onDisconnected);
}

function sendNativeMessage(message) {
	connectNativeMessage();
	port.postMessage(message);
}
/////////////////////////////Native Message Function Defination - End