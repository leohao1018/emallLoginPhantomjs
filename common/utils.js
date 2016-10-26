/**
 * Created by liang.hao on 2016/10/26.
 */

const fs = require('fs');
var apiResult = require('./../model/apiResult.js');
var dateFormat = require('dateformat');
const fileRootPath = "D:\\tblogintemp";
var utils = exports;

/*
 * 文件名前缀
 * */
utils.generateFilePrefix = function (token) {
    return fileRootPath + "\\" + dateFormat(new Date(), 'yyyy-mm-dd') + "\\" + token;
}

/*
 * 构建二维码保存路径
 * */
utils.generateBarcodeFileFullName = function (filePrefix) {
    return filePrefix + "_barcode.json";
}

/*
 * 构建cookie保存路径
 * */
utils.generateCookieFileFullName =  function (filePrefix) {
    return filePrefix + "_cookies.json";
}


/*
 * 文件读取
 * */
utils.readFile =  function (fileFullPath, res) {
    fs.exists(fileFullPath, function (exists) {
        // console.log(exists ? 'it\'s there' : 'no passwd!');

        if (exists) {
            fs.readFile(fileFullPath, 'utf8', function (err, data) {
                var result = new apiResult(true, data, "文件读取成功");
                if (err != null) {
                    var desc = fileFullPath + " 文件读取失败";
                    result.success = false;
                    result.data = {};
                    result.description = desc;
                    console.log(desc);
                }

                res.json(result);
            });
        }
        else {
            var desc = fileFullPath + " 文件不存在";

            var result = new apiResult(false, {}, desc);

            res.json(result);
            console.log(desc);
        }
    });
}
