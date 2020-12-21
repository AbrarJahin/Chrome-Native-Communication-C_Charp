// var hostName = "com.bcc.chrome.extension.native.communication";
var isNotChromeBrowser = true;

$(document).ready(function () {
	if(jQuery.inArray(getUserBrowser(), ["chrome", "MS Edge Chromium"]) == -1){
		return;
	} else{
		isNotChromeBrowser = false;
		fixChromeBackCompatblity();
	}

	$(".btn-connect").on("click",function(){
		alert("Clicked Connect Button");
	});

	//var firstHref = $("a").eq(0).attr("href");
	//console.log(firstHref);

	$(".btn-digital-sign").on("click",function(){
		var signText = $(this).attr('sign-xml');
		var signReason = $(this).attr('sign-reason');
		var signId = $(this).attr('sign-server-id');
		if(!performSign(signText, signReason, signId))
		{
			alert("Sign perform failed");
		}
		else
		{
			console.log("File signing done");
		}
	});
});

function performSign(signText, signReason = "Not Provided", signId = "Not Provided"){
	if(typeof(signText)  === "undefined"){
		alert("A file should be provided in 'sign-xml' property to perform sign");
		return false;
	} else if(isNotChromeBrowser){
		alert("Only Chrome or Edge Browser is supported!");
		return false;
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
			console.log(response);	
		});
	} catch (error) {
		console.log(error);
		reloadExtension();
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
		console.log("kios mode enabled");
		chrome.runtime.restart();
	}
}