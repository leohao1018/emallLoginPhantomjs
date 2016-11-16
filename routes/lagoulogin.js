"use strict";

var fs = require('fs');
var page = require('webpage').create(),
    system = require('system'),
    address = "https://passport.lagou.com/login/login.html",
    barcodeFileFullName,
    cookiesFileFullPath;

initParam();
setPage()
openPage();

/*
 * 定义退出方法
 * */
function quit() {
    // 120s 后退出
    setTimeout(function () {
        // page.render('example.png');
        console.log("phantom quit!");
        phantom.exit();
    }, 100000);
}

/*
 * 初始化参数
 * */
function initParam() {
    barcodeFileFullName = system.args[1];
    cookiesFileFullPath = system.args[2];
    if (barcodeFileFullName == undefined || cookiesFileFullPath == undefined) {
        console.log("barcodeFileFullName, cookiesFileFullPath can not be empty");
    }
}

/*
 * page 参数设置
 * */
function setPage() {

    page.onConsoleMessage = function (msg) {
        console.log(msg);
    };

    page.settings.userAgent = 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36';

    page.onResourceRequested = function (reqData, request) {
        var reqUrl = reqData.url;
        // console.log(reqUrl);

        // 保存验证码
        if (reqUrl.indexOf("https://passport.lagou.com/vcode/create?from=register") > -1) {
            var data = {barcodeUrl: reqUrl};
            var strContent = JSON.stringify(reqData);
            fs.write(barcodeFileFullName, strContent, 'w');

            console.log("barcode is saved!");
        }
    };

    page.onResourceReceived = function (res) {
        if (res.url.indexOf("https://my.alipay.com/tile/service/portal:recent.tile") > -1) {
            var data = {successCookies: phantom.cookies};
            var strContent = JSON.stringify(data);
            fs.write(cookiesFileFullPath, strContent, 'w');

            console.log("success cookies saved!");
        }
    };
}

/*
 * 访问url
 * */
function openPage() {
    page.open(address, function (status) {
        if (status === "success") {
            console.log("open address success!");
            var imagestr = page.evaluate(function () {
                return "";
            });

        } else {
            console.log("open address error!");
            phantom.exit(1);
        }
        quit();
    });
}

phantom.onError = function (msg, trace) {
    var msgStack = ['PHANTOM ERROR: ' + msg];
    if (trace && trace.length) {
        msgStack.push('TRACE:');
        trace.forEach(function (t) {
            msgStack.push(' -> ' + (t.file || t.sourceURL) + ': ' + t.line + (t.function ? ' (in function ' + t.function + ')' : ''));
        });
    }
    console.error(msgStack.join('\n'));
    phantom.exit(1);
};






