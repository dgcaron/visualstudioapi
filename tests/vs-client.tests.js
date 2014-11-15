// UnitTest.js 

var assert = require('assert');
var proxyquire = require('proxyquire');

var httpRequest = {};
var vs = proxyquire('../vs-client.js',
    {
        'request': httpRequest
    });

var clientSettings = {
    "userId" : "userid",
    "clientId":"clientid",
    "redirectUrl": "url",
    "tokenUrl": "https://app.vssps.visualstudio.com/oauth2/token?mkt=nl-NL"
}

describe('Visual Studio API', function () {
    it('Headers', function () {
        var api = new vs.Tokens(clientSettings);
        assert.equal(api.headers["Content-Type"], "application/x-www-form-urlencoded");
    });

    it('tokenUri', function () {
        var api = new vs.Tokens(clientSettings);

        assert.equal(api.tokenUrl, "https://app.vssps.visualstudio.com/oauth2/token?mkt=nl-NL");
    });

    it('createPayload', function () {

        // Arrange
        var api = new vs.Tokens(clientSettings);
       
        // Act
        var payload = api.createPayload("grant", "assertion");

        // Assert
        assert.equal(payload.client_assertion, "clientid");
        assert.equal(payload.grant_type, "grant");
        assert.equal(payload.assertion, "assertion");
        assert.equal(payload.redirect_uri, "url");
    });

    it('getTokenReturnsTokenOnSuccess', function () {

        // Arrange
        var api = new vs.Tokens(clientSettings);
        config.appSettings = {
            'vsclient_assertion_type': 'assertion_type',
            'vsclient_assertion': 'clientid',
            'vsredirect_uri': 'url'
        }

        httpRequest.post = function (options, callback) {
            console.log('intercepted post');
            callback(null, { statusCode: 200 }, "{\"expires_in\":899}");
        }

        api.getToken({
            assertion: 'assertion',
            success: function (token) {
                assert.ok(true, token);
            }
        });
    });

    it('getTokenReturnsErrorOnFailure', function () {
        // Arrange
        var api = new vs.Tokens(clientSettings);
        config.appSettings = {
            'vsclient_assertion_type': 'assertion_type',
            'vsclient_assertion': 'clientid',
            'vsredirect_uri': 'url'
        }

        httpRequest.post = function (options, callback) {
            console.log('intercepted post');
            callback(null, { statusCode: 404 }, "{\"expires_in\":899}");
        }

        api.getToken({
            assertion: 'assertion',
            error: function (statusCode, message) {
                assert.equal(404, statusCode);
            }
        });
    });

    it('getTokenReturnsBadRequestOnInnerError', function () {

        // Arrange
        var api = new vs.Tokens(clientSettings);
        config.appSettings = {
            'vsclient_assertion_type': 'assertion_type',
            'vsclient_assertion': 'clientid',
            'vsredirect_uri': 'url'
        }

        httpRequest.post = function (options, callback) {
            console.log('intercepted post');
            callback("BAD request", { statusCode: 200 }, "{\"expires_in\":899}");
        }

        api.getToken({
            assertion: 'assertion',
            succes: function (token) {
                assert.ok(false, token);
            },
            error: function (statusCode, message) {
                assert.equal(400, statusCode);
            }
        });
    });

    it('renewTokenReturnsBadRequestOnInnerError', function () {
        
        // Arrange
        var api = new vs.Tokens(clientSettings);
        config.appSettings = {
            'vsclient_assertion_type': 'assertion_type',
            'vsclient_assertion': 'clientid',
            'vsredirect_uri': 'url'
        }
        
        httpRequest.post = function (options, callback) {
            console.log('intercepted post');
            callback("BAD request", { statusCode: 200 }, "{\"expires_in\":899}");
        }
        
        api.renewToken({
            assertion: 'assertion',
            succes: function (token) {
                assert.ok(false, token);
            },
            error: function (statusCode, message) {
                assert.equal(400, statusCode);
            }
        });
    });


    it('renewTokenReturnsBadRequestOnInnerError', function () {
        
        // Arrange
        var api = new vs.Tokens(clientSettings);
        config.appSettings = {
            'vsclient_assertion_type': 'assertion_type',
            'vsclient_assertion': 'clientid',
            'vsredirect_uri': 'url'
        }
        
        httpRequest.post = function (options, callback) {
            console.log('intercepted post');
            callback("BAD request", { statusCode: 200 }, "{\"expires_in\":899}");
        }
        
        api.renewToken({
            assertion: 'assertion',
            succes: function (token) {
                assert.ok(false, token);
            },
            error: function (statusCode, message) {
                assert.equal(400, statusCode);
            }
        });
    });

    
})
