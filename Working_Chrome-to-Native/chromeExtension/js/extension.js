// var hostName = "com.bcc.chrome.extension.native.communication";
var isNotChromeBrowser = true;
let guidToSignedDataMap = new Map();
let guidToThisMap = new Map();
const thisDataSet = new Set();

$(document).ready(function () {
	if(jQuery.inArray(getUserBrowser(), ["chrome", "MS Edge Chromium"]) == -1){
		return;
	} else{
		isNotChromeBrowser = false;
		fixChromeBackCompatblity();
	}

	$(".btn-digital-sign").on("click",function(){
		var signText = $(this).attr('sign-xml');
		var signReason = $(this).attr('sign-reason');
		var signId = $(this).attr('sign-server-id');
		if(!performSign(signText, signReason, signId, $(this)))
		{
			alert("Sign perform failed");
		}
		else
		{
			//console.log("File signing done");
		}
	});
});

function performSign(signText, signReason = "Not Provided", signId = "Not Provided", thisContent = null){
	if(typeof(signText)  === "undefined"){
		alert("A file should be provided in 'sign-xml' property to perform sign");
		return false;
	} else if(isNotChromeBrowser){
		alert("Only Chrome or Edge Browser is supported!");
		return false;
	}
	if(thisDataSet.has(thisContent)){
		return false;
	} else{
		thisDataSet.add(thisContent);
	}
	//Perform sign with Chrome Native Messaging - send data to background script
	try {
		chrome.runtime.sendMessage({
			eventType: 'signature',
			signText: signText,
			signReason: signReason,
			signId: signId
		},
		function (response) {
			guidToThisMap.set(response.guid, thisContent);
			var timeInterval = setInterval(function(){
				//console.debug(response);
				if(guidToSignedDataMap.has(response.guid)){
					var data = guidToSignedDataMap.get(response.guid);
					guidToSignedDataMap.delete(response.guid);
					guidToThisMap.get(response.guid).attr("signed-xml", data.data.signXmlText);
					guidToThisMap.get(response.guid).trigger("DOMAttrModified");
					guidToThisMap.delete(response.guid);
					//console.log(data);
					clearInterval(timeInterval);
					//console.debug("Signing Done");
					return;
				} else{
					var nativeResponse = getIfResponseAvailableById(response.guid, thisContent);
					if(!nativeResponse){
						console.log("Error in getting status");
						console.log(nativeResponse);
					}
				}
			}, 100);
			setTimeout(() => {
				clearInterval(timeInterval);
				//console.log("Check Cleared");
			}, 600000);//10 min wait
		});
	} catch (error) {
		console.log(error);
		reloadExtension();
	}
	return true;
}

function getIfResponseAvailableById(guid, thisContent = null){
	try {
		chrome.runtime.sendMessage({
			eventType: 'getSignature',
			signId: guid
		},
		function (response) {
			switch(response.status) {
				case "success":
					guidToSignedDataMap.set(guid, response);
					thisDataSet.delete(thisContent);
					break;
				case "processing":
					//console.log("Processing - " + guid + " - " + (new Date()).getMilliseconds());
					break;
				case "processed":
					//console.log("Already processed - " + guid + " - " + (new Date()).getMilliseconds());
					break;
				default:
					//thisDataSet.delete(thisContent);
					//console.log("All case failed for retrieve signature - " + guid);
			}
		});
	} catch (error) {
		console.log(error);
		return false;
	}
	return true;
}

function getUserBrowser()
{
	var agent = window.navigator.userAgent.toLowerCase();
	switch (true)
	{
		case agent.indexOf("edge") > -1: return "MS Edge (EdgeHtml)";
		case agent.indexOf("edg") > -1: return "MS Edge Chromium";
		case agent.indexOf("opr") > -1 && !!window.opr: return "opera";
		case agent.indexOf("chrome") > -1 && !!window.chrome: return "chrome";
		case agent.indexOf("trident") > -1: return "Internet Explorer";
		case agent.indexOf("firefox") > -1: return "firefox";
		case agent.indexOf("safari") > -1: return "safari";
		default: return "other";
	}
}

function fixChromeBackCompatblity()
{
	if(chrome)	//Chrome backend Compitablity
	{
		if (!chrome.runtime) {
			// Chrome 20-21
			chrome.runtime = chrome.extension;
		} else if(!chrome.runtime.onMessage) {
			// Chrome 22-25
			chrome.runtime.onMessage = chrome.extension.onMessage;
			chrome.runtime.sendMessage = chrome.extension.sendMessage;
			chrome.runtime.onConnect = chrome.extension.onConnect;
			chrome.runtime.connect = chrome.extension.connect;
		}
	}
}

function reloadExtension() {
	try {
		chrome.runtime.reload();
	} catch (error) {
		//console.log("kios mode enabled");
		chrome.runtime.restart();
	}
}