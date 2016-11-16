/**
 * Created by liang.hao on 2016/9/22.
 */

var express = require('express');
var router = express.Router();
const fs = require('fs');
const exec = require('child_process').exec;
var apiResult = require('./../model/apiResult.js');
var utils = require('./../common/utils.js');

const execJsPath = "E:\\09_nodejsFile\\emallLoginPhantomjs\\routes\\lagoulogin.js";


/*
 * initBarcode
 * 执行 Phantomjs 获取登陆二维码
 * 程序无法返回二维码
 * */
router.get('/initBarcode', function (req, res, next) {
    // var token = uuid.v4();
    var token = req.query["requestToken"];

    var filePrefix = utils.generateFilePrefix(token);
    var barcodeFileFullName = utils.generateBarcodeFileFullName(filePrefix);
    var cookieFileFullName = utils.generateCookieFileFullName(filePrefix);
    var cmdStr = 'phantomjs ' + execJsPath + ' ' + barcodeFileFullName + ' ' + cookieFileFullName;

    exec(cmdStr, function (error, stdout, stderr) {
            if (!error) {
                console.log('chileProcess exec success');
                // console.log(stdout);
                // console.log(stderr);
            }
            else {
                console.log('exec error: ' + error);
            }
        }
    );

    // var apiResult = {success: true, result: token, description: "初始化成功"};
    res.json(new apiResult(true, token, "初始化成功"));
})

/*
 * getBarcode
 * */
router.get('/getBarcode', function (req, res, next) {
    var requestToken = req.query["requestToken"];

    var barcodeFileFullName = utils.generateBarcodeFileFullName(utils.generateFilePrefix(requestToken));

    utils.readFile(barcodeFileFullName, res);
})


/*
 * getCookies
 * */
router.get('/getCookies', function (req, res, next) {
    var requestToken = req.query["requestToken"];

    var cookieFileFullName = utils.generateCookieFileFullName(utils.generateFilePrefix(requestToken));

    // 这里获取的cookie 字符串需要去重否则有些重复的cookie 无法使用
    utils.readFile(cookieFileFullName, res);
})


module.exports = router;