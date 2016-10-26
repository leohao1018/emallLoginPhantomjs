/**
 * Created by hadoop on 2016/9/22.
 */

var express = require('express');
var router = express.Router();
var phantom = require('phantom');
var uuid = require('uuid');

/* GET / page. */
router.get('/', function (req, res, next) {
    res.render('index', {title: 'Express'});
});

var phInstance = null;
/* GET init page. */
router.get('/init', function (req, res, next) {

    var token = uuid.v4();

    if (phInstance == null)
        create(token);
    else
        doPage(token);

    res.render('index', {title: "结束"});
});

function create(token) {
    var sitePage = null;
    phantom.create()
        .then(function (instance) {
            phInstance = instance;
            return instance.createPage();
        })
        .then(function (page) {
            sitePage = page;

            setPageProperty(sitePage, token);

            return page.open('https://login.taobao.com/member/login.jhtml?redirectURL=https://buyertrade.taobao.com/trade/itemlist/list_bought_items.htm');
        })
        .then(function (status) {
            return sitePage.property('content');
        })
        .then(function (content) {
            doEvaluate(sitePage, token);
        })
        .catch(function (error) {
            doError(error);
        });

}
function doPage(token) {
    var sitePage = null;
    phInstance.createPage()
        .then(function (page) {
            sitePage = page;
            setPageProperty(sitePage, token);

            return page.open('https://login.taobao.com/member/login.jhtml?redirectURL=https://buyertrade.taobao.com/trade/itemlist/list_bought_items.htm');
        })
        .then(function (status) {
            return sitePage.property('content');
        })
        .then(function (content) {
            doEvaluate(sitePage, token);
        })
        .catch(function (error) {
            doError(error);
        });

}
/* sitePage 属性设置*/
function setPageProperty(sitePage, token) {
    sitePage.token = token;

    sitePage.property('userAgent', 'Mozilla/5.0 (iPhone; CPU iPhone OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 Safari/601.1');
    sitePage.property('onResourceRequested', function (requestData, networkRequest) {
        var reqUrl = requestData.url;

        if (reqUrl.indexOf("https://img.alicdn.com/tfscom/") > -1) {
            console.log(reqUrl);
        }

        if (reqUrl.indexOf("https://login.taobao.com/member/login.jhtml") <= -1 &&
            reqUrl.indexOf("https://buyertrade.taobao.com/trade/itemlist/list_bought_items.htm") > -1) {
            // console.log("list_bought_items.htm request Header: " + JSON.stringify(requestData.headers));
        }
    });

    sitePage.property('onResourceReceived', function (responseData, networkRequest) {
        if (responseData.url.indexOf("https://login.taobao.com/member/loginByIm.do") > -1) {
            console.log("loginByIm.do response Header: " + JSON.stringify(responseData.headers));
        }
    });

}
/* doEvaluate*/
function doEvaluate(sitePage, token) {
    // console.log(content);
    // sitePage.property('viewportSize', {width: 800, height: 800})
    // sitePage.render('google_home.jpeg', {format: 'jpeg', quality: '100'});

    sitePage.evaluate(function () {
        return document;
    }).then(function (document) {
        console.log(document.cookie);
    });
}
/* doError*/
function doError(error, sitePage) {
    console.log(error);
    sitePage.close();
    phInstance.exit();

}



module.exports = router;