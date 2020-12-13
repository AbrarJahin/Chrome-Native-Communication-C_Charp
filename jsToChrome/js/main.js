$(document).ready(function () {
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
    if(typeof(signText)  === "undefined")
    {
        alert("A file should be provided in 'sign-xml' property to perform sign");
        return false;
    }
    else if(jQuery.inArray(getUserBrowser(), ["chrome", "MS Edge Chromium"]) == -1)
    {
        alert("Currently only Chrome and latest Edge (windows default) browsre is supported");
        return false;
    }
    //Perform sign with Chrome Native Messaging
    console.log(signText, signReason, signId, (new Date()).toUTCString());
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