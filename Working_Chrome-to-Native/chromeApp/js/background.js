chrome.runtime.onInstalled.addListener(function() {
	console.log("OK");
});

// Bind event:
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
	switch(message.eventType) {
		case "signature":
			var status = ["signed", "rejected"];
			var signedText = "OK";
			// setTimeout(function() {
			// 	sendResponse({
			// 		message: message,
			// 		sender: sender,
			// 		time : (new Date()).toUTCString() + "-" + (new Date()).getMilliseconds(),
			// 		status: status,
			// 		signedText: signedText
			// 	});
			// }, 4000);
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