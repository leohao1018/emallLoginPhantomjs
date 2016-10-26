/**
 * Created by liang.hao on 2016/9/22.
 */

var express = require('express');
var router = express.Router();
const fs = require('fs');
const exec = require('child_process').exec;
var apiResult = require('./../model/apiResult.js');
var utils = require('./../common/utils.js');

const execJsPath = "C:\\Users\\hadoop\\WebstormProjects\\taobaoPhantomjs\\routes\\taobaologin.js";

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

    utils.readFile(cookieFileFullName, res);
})

//
// /*
//  * 文件名前缀
//  * */
// function generateFilePrefix(token) {
//     return fileRootPath + "\\" + dateFormat(new Date(), 'yyyy-mm-dd') + "\\" + token;
// }
//
// /*
//  * 构建二维码保存路径
//  * */
// function generateBarcodeFileFullName(filePrefix) {
//     return filePrefix + "_barcode.json";
// }
//
// /*
//  * 构建cookie保存路径
//  * */
// function generateCookieFileFullName(filePrefix) {
//     return filePrefix + "_cookies.json";
// }
//
// /*
//  * 文件读取
//  * */
// function readFile(fileFullPath, res) {
//     fs.exists(fileFullPath, function (exists) {
//         // console.log(exists ? 'it\'s there' : 'no passwd!');
//
//         if (exists) {
//             fs.readFile(fileFullPath, 'utf8', function (err, data) {
//                 var result = new apiResult(true, data, "文件读取成功");
//                 if (err != null) {
//                     var desc = fileFullPath + " 文件读取失败";
//                     result.success = false;
//                     result.data = {};
//                     result.description = desc;
//                     console.log(desc);
//                 }
//
//                 res.json(result);
//             });
//         }
//         else {
//             var desc = fileFullPath + " 文件不存在";
//
//             var result = new apiResult(false, {}, desc);
//
//             res.json(result);
//             console.log(desc);
//         }
//     });
// }

module.exports = router;