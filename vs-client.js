// safeguard added to be able to test the scripts
var exports = exports || {};

// define games namespace
var VisualStudio = VisualStudio || {};

VisualStudio.Tokens = function (options) {
    
    this.user = options.user;
    this.clientId = options.clientId;
    this.redirectUrl = options.redirectUrl;
    this.tokenUrl = options.tokenUrl;
   
    this.headers = { 'Content-Type': 'application/x-www-form-urlencoded' };

    this.createPayload = function (grant_type, assertion) {
        var data =  {
            "client_assertion_type": "urn:ietf:params:oauth:client-assertion-type:jwt-bearer",
            "client_assertion": this.clientId,
            "grant_type": grant_type,
            "assertion": assertion,
            "redirect_uri": this.redirectUrl
        };
        
        return data;
    };
};

VisualStudio.Tokens.prototype.getToken = function (request) {
    var httpRequest = require('request');

    httpRequest.post(
    {
        uri: this.tokenUrl,
        headers: this.headers,
        form: this.createPayload("urn:ietf:params:oauth:grant-type:jwt-bearer", request.assertion)
    }, 
    function (error, response, body) {
        if (!error && request.success && response.statusCode == 200) {
            request.success(JSON.parse(body));
        }
        else if (request.error) {
            if (error) {
                request.error(400, error);
            }
            else {
                request.error(response.statusCode, body);
            }
        }
    });
};

VisualStudio.Tokens.prototype.renewToken = function (request) {
    var httpRequest = require('request');
    httpRequest.post({
        uri: this.tokenUrl,
        headers: this.headers,
        form: this.createPayload("refresh_token", request.assertion)
    }, 
    function (error, response, body) {
        if (!error && request.success && response.statusCode == 200) {
            request.success(JSON.parse(body));
        }
        else if (request.error) {
            if (error) {
                request.error(400, error);
            }
            else {
                request.error(response.statusCode, body);
            }
        }
    });
};

exports.Tokens = VisualStudio.Tokens;
