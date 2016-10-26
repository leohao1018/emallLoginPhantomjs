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
    address = "https://auth.alipay.com/login/index.htm",
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

    // page.onConsoleMessage = function (msg) {
    //     console.log(msg);
    // };

    page.settings.userAgent = 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36';

    page.onResourceRequested = function (reqData, request) {
        var reqUrl = reqData.url;
        // console.log(reqUrl);

        // 移除二维码中 非当前domain 图标，否则 $canvas[0].toDataURL('image/png') 报错
        if (reqUrl.indexOf("t.alipayobjects.com/images/rmsweb/T1Fb0iXnJiXXXXXXXX.png") > -1) {
            // console.log('The url of the request is matching. Aborting: ' + reqData['url']);
            request.abort();
        }

        // 页面轮询js请求
        // if (reqUrl.indexOf("securitycore.alipay.com/barcode/barcodeProcessStatus.json") > -1) {
        //     console.log(reqUrl);
        // }
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

                // 触发二维码li 点击事件 显示二维码
                var ev = document.createEvent("MouseEvents");
                ev.initEvent("click", true, true);
                document.querySelector("#J-loginMethod-tabs > li:nth-child(1)").dispatchEvent(ev);

                // 获取二维码图片
                var $canvas = document.getElementsByClassName("barcode");
                var str = $canvas[0].toDataURL('image/png');
                return str;
            });

            var data = {imageStr: imagestr};
            var strContent = JSON.stringify(data);
            fs.write(barcodeFileFullName, strContent, 'w');
            console.log('barcode is saved!');
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






