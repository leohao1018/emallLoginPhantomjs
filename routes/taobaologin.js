"use strict";

Date.prototype.format = function (format) {
    var o = {
        "M+": this.getMonth() + 1, //month
        "d+": this.getDate(),    //day
        "h+": this.getHours(),   //hour
        "m+": this.getMinutes(), //minute
        "s+": this.getSeconds(), //second
        "q+": Math.floor((this.getMonth() + 3) / 3),  //quarter
        "S": this.getMilliseconds() //millisecond
    }
    if (/(y+)/.test(format)) format = format.replace(RegExp.$1,
        (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)if (new RegExp("(" + k + ")").test(format))
        format = format.replace(RegExp.$1,
            RegExp.$1.length == 1 ? o[k] :
                ("00" + o[k]).substr(("" + o[k]).length));
    return format;
}

var fs = require('fs');
var page = require('webpage').create(),
    system = require('system'),
    address = "https://login.taobao.com/member/login.jhtml",
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
        console.log("phantom quit");
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
    page.settings.userAgent = 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36';

    page.onResourceRequested = function (req) {
        // console.log('requested: ' + JSON.stringify(req, undefined, 4));
        // console.log(req.url);

        var reqUrl = req.url;
        if (reqUrl.indexOf("https://img.alicdn.com/tfscom/") > -1) {
            var data = {barcodeUrl: reqUrl};
            var strContent = JSON.stringify(data);
            fs.write(barcodeFileFullName, strContent, 'w');

            console.log("barcode is saved!");
        }
    };

    page.onResourceReceived = function (res) {
        // console.log('received: ' + JSON.stringify(res, undefined, 4));
        // console.log(res.url);

        if (res.url.indexOf("https://login.taobao.com/member/loginByIm.do") > -1) {
            // console.log("loginByIm.do response Header: " + JSON.stringify(res.headers));
            // console.log(JSON.stringify(phantom.cookies));

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
        }
        else {
            console.log("open address error!");
            phantom.exit();
        }
        quit()
    });
}






