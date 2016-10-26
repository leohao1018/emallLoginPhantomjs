/**
 * Created by liang.hao on 2016/9/22.
 */

function apiResult(success, result, description) {
    this.success = success;
    this.data = result;
    this.description = description;
};

module.exports = apiResult;