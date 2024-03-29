const Request = require('request');
const qs = require('qs');
const Config = require('../config');
const Crypto = require('crypto');


module.exports = function(query, res) {
    console.log("get",query);
    // CONST
    const encry = "HmacSHA256";
    const window = "6000";
    const time = new Date().getTime();
    const xtHeaders = {
        'validate-algorithms': encry,
        'validate-appkey': Config.appkey,
        'validate-recvwindow': window,
        'validate-timestamp': time,
    }

    // Signature
    let x = qs.stringify(xtHeaders);
    let y = "#"+ query.method + "#"+ query.path;
    // query
    if (query.param) {
        // y += "#" + decodeURIComponent(qs.stringify(query.param));
        y += "#" + decodeURIComponent(qs.stringify(query.param, {sort:(a, b) => a.localeCompare(b)}));
    }
    // body
    if (query.body && query.body != {}) {
        y += "#" + JSON.stringify(query.body);
    }
    let origin = x + y;
    console.log(origin,"origin")
    const signature = Crypto.createHmac('sha256', Config.SecretKey).update(origin).digest('hex') || "";
    console.log(signature,"signature")

    // API
    Request({
        timeout: 10000,
        url: Config.URL + query.path + `${query && query.param ? "?" + qs.stringify(query.param) : ''}`,
        method: query.method,
        headers: {
            ...xtHeaders,
            'validate-signature': signature
        },
        body: query.body || null,
        json: true,
        }, function (error, response, body) {
        console.log(body);
        res.send(body);
    })

} 
