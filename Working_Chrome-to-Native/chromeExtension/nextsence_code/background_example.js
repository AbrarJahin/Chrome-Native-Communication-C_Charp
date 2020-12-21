var XmlSignExtensionInternal = XmlSignExtensionInternal || {};

XmlSignExtensionInternal.Enum = {
    EventName: {
        ListCertificatesAndSignXml: "ListCertificatesAndSignXml",
        ListCertificatesAndXadesSignXml: "ListCertificatesAndXadesSignXml",
        CheckXmlSignature: "CheckXmlSignature",
        CheckXadesXmlSignature: "CheckXadesXmlSignature",
        XmlChunk: "XmlChunk",
        StartXmlTransfer: "StartXmlTransfer",
        StartBulkXmlTransfer: "StartBulkXmlTransfer",
        ListAndChooseCertificate: "ListAndChooseCertificate",
        Setup: "Setup",
        GetCertificates: "GetCertificates",
        GetLocalizedErrorMessage: "GetLocalizedErrorMessage",
        IsNativeAppInstalled: "IsNativeAppInstalled",
        IsNativeHostApplicationUpToDate: "IsNativeHostApplicationUpToDate",
        SigningXmlWithCustomDialog: "SigningXmlWithCustomDialog",
        SignXmlWithCustomDialog: "SignXmlWithCustomDialog",
        SaveCertificate: "SaveCertificate",
        DeleteCertificate: "DeleteCertificate"
    },
    PageStatusEnum: {
        Start: 1,
        Append: 2,
        Finish: 3
    },
    Url: "https://signingextension.nextsense.com/Installation/NextsenseSigningComponent.msi",
    UrlMac: "https://signingextension.nextsense.com/Installation/NextsenseSigningComponent.pkg",
    CheckPage: "https://signingextension.nextsense.com/ExtensionVerify.html?typeExtension=xml",
    OS:
    {
        Win: 1,
        Mac: 2,
        X11: 3,
        Linux: 4
    },
    Browser: {
        Chrome: 1,
        Opera: 2,
        ChromiumEdge: 6
    }
};

var CheckBrowser = function () {
    var ua = navigator.userAgent, tem,
        M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];

    var tempBrowser = "";

    if (/trident/i.test(M[1])) {
        tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
        tempBrowser = 'IE ' + (tem[1] || '');
    }
    if (M[1] === 'Chrome') {
        tem = ua.match(/\b(OPR|Edge)\/(\d+)/);
        if (tem != null)
            tempBrowser = tem.slice(1).join(' ').replace('OPR', 'Opera');
    }
    else
        M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];

    if ((tem = ua.match(/version\/(\d+)/i)) != null)
        M.splice(1, 1, tem[1]);

    var fullBrowser = "";

    if (tempBrowser != "")
        fullBrowser = tempBrowser;
    else
        fullBrowser = M[0];

    if (fullBrowser.includes("Chrome"))
        return XmlSignExtensionInternal.Enum.Browser.Chrome;

    if (fullBrowser.includes("Opera"))
        return XmlSignExtensionInternal.Enum.Browser.Opera;

    if (fullBrowser.includes("Edge"))
        return XmlSignExtensionInternal.Enum.Browser.ChromiumEdge;

    return 0;
};

var browserType = CheckBrowser();

function handleInstalled(details) {
    if (details.reason === "install") {
        chrome.tabs.create({
            url: XmlSignExtensionInternal.Enum.CheckPage
        });
    }
}

chrome.runtime.onInstalled.addListener(handleInstalled);

var port = null;
var connectToNative = function () {
    var hostName = "nextsense.signing.component";
    port = chrome.runtime.connectNative(hostName);
    port.onMessage.addListener(onNativeMessage);
    port.onDisconnect.addListener(onDisconnected);
};

var chrome = chrome || {};
var selectedTabs = [];

//povik od extension api js
chrome.runtime.onMessageExternal.addListener(
    function (request, sender, sendResponse) {
        var message;

        chrome.tabs.getSelected(null, function (tab) {
            if (request != undefined && request.model != undefined && request.model.id != undefined) {
                var isAdded = false;
                for (var i = 0; i < selectedTabs.length; i++) {
                    if (selectedTabs[i].Value == request.model.id) {
                        isAdded = true;
                        break;
                    }
                }

                if (!isAdded) {
                    var selectedTab = {};
                    selectedTab.Key = tab.id;
                    selectedTab.Value = request.model.id;
                    selectedTabs.push(selectedTab);
                }
            }
        });

        switch (request.EventName) {
            case XmlSignExtensionInternal.Enum.EventName.Setup:
                message = {
                    "EventName": XmlSignExtensionInternal.Enum.EventName.Setup,
                    "languageId": request.model.languageId
                }
                chrome.tabs.getSelected(null, function (tab) {
                    chrome.tabs.sendMessage(tab.id, message);
                    delete message;
                });
                break;
            case XmlSignExtensionInternal.Enum.EventName.IsNativeHostApplicationUpToDate:
                message = {
                    "Id": request.model.id,
                    "EventName": XmlSignExtensionInternal.Enum.EventName.IsNativeHostApplicationUpToDate,
                    "ExtensionType": 'XmlExtension'
                }
                port.postMessage(message);
                message = null;
                break;
            case XmlSignExtensionInternal.Enum.EventName.GetCertificates:
                message = {
                    "Id": request.model.id,
                    "EventName": XmlSignExtensionInternal.Enum.EventName.GetCertificates,
                    "CertificateSubject": request.model.certificateSubject,
                    "CertificateIssuer": request.model.certificateIssuer,
                    "CertificateThumbprint": request.model.certificateThumbprint,
                    "OnlyValidCertificate": request.model.onlyValidCertificate,
                    "BrowserType": browserType
                };
                port.postMessage(message);

                message = null;
                break;
            case XmlSignExtensionInternal.Enum.EventName.GetLocalizedErrorMessage:
                message = {
                    "EventName": XmlSignExtensionInternal.Enum.EventName.GetLocalizedErrorMessage,
                    "Message": request.model.message,
                    "Id": request.model.id
                }
                chrome.tabs.getSelected(null, function (tab) {
                    chrome.tabs.sendMessage(tab.id, message);
                    delete message;
                });
                break;
            case XmlSignExtensionInternal.Enum.EventName.ListCertificatesAndSignXml:
                message = {
                    "Id": request.model.id,
                    "EventName": XmlSignExtensionInternal.Enum.EventName.ListCertificatesAndSignXml,
                    "XmlForSign": request.model.xmlForSign,
                    "XmlReferences": request.model.xmlReferences,
                    "CertificateSubject": request.model.certificateSubject,
                    "CertificateIssuer": request.model.certificateIssuer,
                    "CertificateThumbprint": request.model.certificateThumbprint,
                    "OnlyValidCertificate": request.model.onlyValidCertificate,
                    "BrowserType": browserType,
                    "XmlSignatureType": request.model.xmlSignatureType,
                    "SignatureAlgorithamType": request.model.signatureAlgorithamType
                };
                port.postMessage(message);
                message = null;
                break;
            case XmlSignExtensionInternal.Enum.EventName.ListCertificatesAndXadesSignXml:
                message = {
                    "Id": request.model.id,
                    "EventName": XmlSignExtensionInternal.Enum.EventName.ListCertificatesAndXadesSignXml,
                    "XmlForSign": request.model.xmlForSign,
                    "XmlReferences": request.model.xmlReferences,
                    "CertificateSubject": request.model.certificateSubject,
                    "CertificateIssuer": request.model.certificateIssuer,
                    "CertificateThumbprint": request.model.certificateThumbprint,
                    "OnlyValidCertificate": request.model.onlyValidCertificate,
                    "BrowserType": browserType,
                    "XmlSignatureType": request.model.xmlSignatureType,
                    "SignatureAlgorithamType": request.model.signatureAlgorithamType,
                    "SignatureFormat": request.model.signatureFormat,
                    "TsaUrl": request.model.tsaUrl,
                    "TsaUser": request.model.tsaUser,
                    "TsaPassword": request.model.tsaPassword,
                    "XadesProfileType": request.model.xadesProfileType,
                    "SignatureProductionCity": request.model.SignatureProductionCity,
                    "SignatureProductionCountry": request.model.SignatureProductionCountry,
                    "SignatureProductionPostalCode": request.model.SignatureProductionPostalCode,
                    "SignatureProductionStateOrProvince": request.model.SignatureProductionStateOrProvince
                };
                port.postMessage(message);
                message = null;
                break;
            case XmlSignExtensionInternal.Enum.EventName.CheckXmlSignature:
                message = {
                    "Id": request.model.id,
                    "EventName": XmlSignExtensionInternal.Enum.EventName.CheckXmlSignature,
                    "SignedXml": request.model.signedXml,
                    "Signature": request.model.signature
                }

                port.postMessage(message);
                message = null;
                break;
            case XmlSignExtensionInternal.Enum.EventName.CheckXadesXmlSignature:
                message = {
                    "Id": request.model.id,
                    "EventName": XmlSignExtensionInternal.Enum.EventName.CheckXadesXmlSignature,
                    "SignedXml": request.model.signedXml,
                    "Signature": request.model.signature
                }
                port.postMessage(message);
                message = null;
                break;
            case XmlSignExtensionInternal.Enum.EventName.StartXmlTransfer:
            case XmlSignExtensionInternal.Enum.EventName.StartBulkXmlTransfer:
                message = {
                    "Id": request.model.id,
                    "EventName": request.EventName,
                    "XmlReferences": request.model.xmlReferences,
                    "CertificateSubject": request.model.certificateSubject,
                    "CertificateIssuer": request.model.certificateIssuer,
                    "CertificateThumbprint": request.model.certificateThumbprint,
                    "OnlyValidCertificate": request.model.onlyValidCertificate,
                    "BrowserType": browserType,
                    "XmlSignatureType": request.model.xmlSignatureType,
                    "SignatureAlgorithamType": request.model.signatureAlgorithamType,
                    "SignatureFormat": request.model.signatureFormat,
                    "TsaUrl": request.model.tsaUrl,
                    "TsaUser": request.model.tsaUser,
                    "TsaPassword": request.model.tsaPassword,
                    "XmlChunksCount": request.model.xmlChunksCount,
                    "XadesProfileType": request.model.xadesProfileType,
                    "SignatureProductionCity": request.model.signatureProductionCity,
                    "SignatureProductionCountry": request.model.signatureProductionCountry,
                    "SignatureProductionPostalCode": request.model.signatureProductionPostalCode,
                    "SignatureProductionStateOrProvince": request.model.signatureProductionStateOrProvince
                };
                port.postMessage(message);
                message = null;
                break;
            case XmlSignExtensionInternal.Enum.EventName.XmlChunk:
                message = {
                    "Id": request.model.id,
                    "EventName": XmlSignExtensionInternal.Enum.EventName.XmlChunk,
                    "XmlChunk": request.model.xmlChunk,
                    "XmlOrderNumber": request.model.xmlOrderNumber,
                    "XmlChunksCount": request.model.xmlChunksCount
                };
                port.postMessage(message);
                message = null;
                break;
            case XmlSignExtensionInternal.Enum.EventName.ListAndChooseCertificate:
                message = {
                    "Id": request.model.id,
                    "EventName": XmlSignExtensionInternal.Enum.EventName.ListAndChooseCertificate,
                    "CertificateSubject": request.model.certificateSubject,
                    "CertificateIssuer": request.model.certificateIssuer,
                    "CertificateThumbprint": request.model.certificateThumbprint,
                    "OnlyValidCertificate": request.model.onlyValidCertificate,
                    "BrowserType": browserType
                };
                port.postMessage(message);
                message = null;
                break;
            case XmlSignExtensionInternal.Enum.EventName.SigningXmlWithCustomDialog:
                message = {
                    "Id": request.model.id,
                    "EventName": XmlSignExtensionInternal.Enum.EventName.SigningXmlWithCustomDialog,
                    "XmlForSign": request.model.xmlForSign,
                    "XmlReferences": request.model.xmlReferences,
                    "CertificateSubject": request.model.certificateSubject,
                    "CertificateIssuer": request.model.certificateIssuer,
                    "CertificateThumbprint": request.model.certificateThumbprint,
                    "OnlyValidCertificate": request.model.onlyValidCertificate,
                    "BrowserType": browserType,
                    "XmlSignatureType": request.model.xmlSignatureType,
                    "SignatureAlgorithamType": request.model.signatureAlgorithamType
                };
                port.postMessage(message);
                message = null;
                break;
            case XmlSignExtensionInternal.Enum.EventName.SaveCertificate:
                message = {
                    "Id": request.model.id,
                    "EventName": XmlSignExtensionInternal.Enum.EventName.SaveCertificate,
                    "Certificate": request.model.certificate,
                    "Password": request.model.password
                }

                port.postMessage(message);
                message = null;
                break;
            case XmlSignExtensionInternal.Enum.EventName.DeleteCertificate:
                message = {
                    "Id": request.model.id,
                    "EventName": XmlSignExtensionInternal.Enum.EventName.DeleteCertificate,
                    "CertificateThumbprint": request.model.certificateThumbprint
                }

                port.postMessage(message);
                message = null;
                break;
            case XmlSignExtensionInternal.Enum.EventName.SignXmlWithCustomDialog:
                message = {
                    "Id": request.model.id,
                    "EventName": XmlSignExtensionInternal.Enum.EventName.SignXmlWithCustomDialog,
                    "CertificateThumbprint": request.model.certificateThumbprint,
                    "Password": request.model.password
                }

                port.postMessage(message);
                message = null;
                break;

            case XmlSignExtensionInternal.Enum.EventName.IsNativeAppInstalled:
                var oS = CheckOS();

                var downloadUrl = "";
                if (oS === XmlSignExtensionInternal.Enum.OS.Win)
                    downloadUrl = XmlSignExtensionInternal.Enum.Url;
                if (oS === XmlSignExtensionInternal.Enum.OS.Mac || oS === XmlSignExtensionInternal.Enum.OS.Linux)
                    downloadUrl = XmlSignExtensionInternal.Enum.UrlMac;

                sendResponse({ IsNativeAppInstalled: port != null, NativeAppUrl: downloadUrl });
                break;
        }

        return true;
    });



//ova e kod koj shto se izvrshuva posle odreden response.
//response moze da se vrati vo forma na eden chunks ili pak dokolku e golem response vo forma na povekje
//vo host app moze da se vidi odensuvanje na host-ot pri golem i mal response
var data = "";
var onNativeMessage = function (message) {
    var tabId = "";
    for (var i = 0; i < selectedTabs.length; i++) {
        if (selectedTabs[i].Value == message.Id) {
            tabId = selectedTabs[i].Key;
            break;
        }
    }

    var eventsWithChunks = [];

    eventsWithChunks = eventsWithChunks.map(function (eventName) {
        return "After" + eventName;
    });

    if (message.EventName && eventsWithChunks.indexOf(message.EventName) !== -1) {
        chrome.tabs.sendMessage(tabId, message);
        delete message;
    } else {
        if (message.Status === XmlSignExtensionInternal.Enum.PageStatusEnum.Start) {
            data = "";
            data += message.Data;
        }
        if (message.Status === XmlSignExtensionInternal.Enum.PageStatusEnum.Append) {
            data += message.Data;
        }
        if (message.Status === XmlSignExtensionInternal.Enum.PageStatusEnum.Finish) {
            data += message.Data;
            message.Data = data;
            chrome.tabs.sendMessage(tabId, message);
            delete message;
            data = "";
        }
    }
}

var CheckOS = function () {
    var osName = 0;
    if (navigator.appVersion.indexOf("Win") !== -1) osName = XmlSignExtensionInternal.Enum.OS.Win;
    if (navigator.appVersion.indexOf("Mac") !== -1) osName = XmlSignExtensionInternal.Enum.OS.Mac;
    if (navigator.appVersion.indexOf("X11") !== -1) osName = XmlSignExtensionInternal.Enum.OS.X11;
    if (navigator.appVersion.indexOf("Linux") !== -1) osName = XmlSignExtensionInternal.Enum.OS.Linux;

    return osName;
}

var onDisconnected = function () {
    port = null;
}


connectToNative();