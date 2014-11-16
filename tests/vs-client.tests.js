// UnitTest.js 

var assert = require('assert');
var should = require('should');
var proxyquire = require('proxyquire');


var httpRequest = {};

function request( options, callback) { 
    httpRequest.invoked(options, callback);
}

var vs = proxyquire('../vs-client.js', { 'request': request });

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
    
    it('renewTokenReturnsTokenOnSuccess', function () {
        
        // Arrange
        var api = new vs.Tokens(clientSettings);
        
        httpRequest.post = function (options, callback) {
            callback(null, { statusCode: 200 }, "{\"expires_in\":899}");
        }
        
        return api.renewToken('assertion').then(function (token) {
            token.should.have.property('expires_in');
        });
    });

    it('renewTokenReturnsBadRequestOnInnerError', function () {
        
        // Arrange
        var api = new vs.Tokens(clientSettings);
        
        httpRequest.post = function (options, callback) {
            callback("BAD request", { statusCode: 200 }, "{'expires_in':899}");
        }
        
       return api.renewToken('assertion').catch(function (error) { 
            error.should.eql("BAD request");
        });
    });
    
   
    it('getProfileReturnsProfile', function () {
        
        // Arrange
        var client = new vs.Client('assertion');
        
        httpRequest.invoked = function (options, callback) {
            callback(null, { statusCode: 200 }, "{\"name\":\"Didier Caron\"}");
        }
        
        return client.getProfile().then(function (result) {
            result.data.should.have.property('name');
        });
    });

    it('buildUrl', function () {
        var client = new vs.Client('assertion');

        client.buildUnscopedUrl('section', { $skip: 0 });
    });
})
