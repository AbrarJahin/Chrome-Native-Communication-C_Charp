//https://stackoverflow.com/questions/31201420/chrome-extension-native-messaging-synchronization

var hostName = "com.bcc.chrome.extension.native.communication";

let guidToSignedDataMap = new Map();

//Startup Event
chrome.runtime.onInstalled.addListener(function() {
	console.log("BCC-CA Extention Loaded.");
});

// Bind event on receiving any message:
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
	switch(message.eventType) {
		case "signature":
			var sentNativeMsg = {
				"signXmlText": message.signText,
				"signReason": message.signReason,
				"signId": message.signId
			};
			var uniqueIdForResponse = guid();
			guidToSignedDataMap.set(uniqueIdForResponse, null);
			chrome.runtime.sendNativeMessage(hostName, sentNativeMsg, function(response) {
				if (chrome.runtime.lastError) {
					console.log("Background ERROR: " + chrome.runtime.lastError.message);
				} else {
					guidToSignedDataMap.set(uniqueIdForResponse, response);
					console.log(response);
					console.log(guidToSignedDataMap);
				}
			});

			sendResponse({
				data: message,
				sender: sender,
				time : (new Date()).toUTCString() + "-" + (new Date()).getMilliseconds(),
				status: "processing",
				guid: uniqueIdForResponse
			});
			break;
		case "getSignature":
			if(message.signId && guidToSignedDataMap.has(message.signId))
			{
				var data = guidToSignedDataMap.get(message.signId);
				if(data!=null)
				{
					sendResponse({
						data: guidToSignedDataMap.get(message.signId),
						sender: sender,
						time : (new Date()).toUTCString() + "-" + (new Date()).getMilliseconds(),
						status: "success",
						guid: message.signId
					});
					guidToSignedDataMap.delete(message.signId);
				}
				else
				{
					sendResponse({
						time : (new Date()).toUTCString() + "-" + (new Date()).getMilliseconds(),
						status: "processing",
						guid: message.signId
					});
				}
				
			}
			else
			{
				sendResponse({
					time : (new Date()).toUTCString() + "-" + (new Date()).getMilliseconds(),
					status: "processed",
					guid: message.signId
				});
			}
			
			break;
		default:
			sendResponse({
				time: (new Date()).toUTCString() + "-" + (new Date()).getMilliseconds(),
				sender: sender,
				status: "Invalid Request"
			});
			break;
	}
});

function guid() {
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
		return v.toString(16);
	});
}