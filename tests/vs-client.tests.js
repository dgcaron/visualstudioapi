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

        var uri = client.buildUnscopedUrl('section', { $skip: 0 });
        assert.ok(uri, "");
    });
});


describe('Builds', function () {
    
    it('getBuild', function () {
        var uri = 'https://account.visualstudio.com/defaultcollection/project/_apis/build/builds/1?api-version=1.0';
        var api = new vs.Client({ access_token: 'token' });
        
        httpRequest.invoked = function (options, callback) {
            options.uri.should.equal(uri);
            callback(null, { statusCode: 200 }, null);
        }
        
        return api.getBuild('account', 'project',1);
    });
    
    it('getBuildDetail', function () {
        var uri = 'https://account.visualstudio.com/defaultcollection/project/_apis/build/builds/1/details?api-version=1.0';
        var api = new vs.Client({ access_token: 'token' });
        
        httpRequest.invoked = function (options, callback) {
            options.uri.should.equal(uri);
            callback(null, { statusCode: 200 }, null);
        }
        
        return api.getBuildDetail('account', 'project',1);
    });

    it('getBuilds', function () {
        var uri = 'https://account.visualstudio.com/defaultcollection/project/_apis/build/builds?api-version=1.0';
        var api = new vs.Client({ access_token: 'token' });
        
        httpRequest.invoked = function (options, callback) {
            options.uri.should.equal(uri);
            callback(null, { statusCode: 200 }, null);
        }
        
        return api.getBuilds('account', 'project');
    });
    
    it('addBuild', function () {
        var uri = 'https://account.visualstudio.com/defaultcollection/project/_apis/build/requests?api-version=1.0';
        var api = new vs.Client({ access_token: 'token' });
        
        httpRequest.invoked = function (options, callback) {
            options.method.should.equal('POST');
            options.uri.should.equal(uri);
            callback(null, { statusCode: 200 }, null);
        }
        
        return api.addBuild('account', 'project', {});
    });
    
    it('updateBuild', function () {
        var uri = 'https://account.visualstudio.com/defaultcollection/project/_apis/build/requests/1?api-version=1.0';
        var api = new vs.Client({ access_token: 'token' });
        
        httpRequest.invoked = function (options, callback) {
            options.method.should.equal('PATCH');
            options.uri.should.equal(uri);
            callback(null, { statusCode: 200 }, null);
        }
        
        return api.updateBuild('account', 'project', 1, {});
    });
    
    it('cancelBuild', function () {
        var uri = 'https://account.visualstudio.com/defaultcollection/project/_apis/build/requests/1?api-version=1.0';
        var api = new vs.Client({ access_token: 'token' });
        
        httpRequest.invoked = function (options, callback) {
            options.method.should.equal('DELETE');
            options.uri.should.equal(uri);
            callback(null, { statusCode: 200 }, null);
        }
        
        return api.cancelBuild('account', 'project', 1);
    });

    it('getBuildDefinition', function () {
        var uri = 'https://account.visualstudio.com/defaultcollection/project/_apis/build/definitions/1?api-version=1.0';
        var api = new vs.Client({ access_token: 'token' });
        
        httpRequest.invoked = function (options, callback) {
            options.uri.should.equal(uri);
            callback(null, { statusCode: 200 }, null);
        }
        
        return api.getBuildDefinition('account', 'project', 1);
    });

    it('getBuildDefinitions', function () {
        var uri = 'https://account.visualstudio.com/defaultcollection/project/_apis/build/definitions?api-version=1.0';
        var api = new vs.Client({access_token:'token'});
        
        httpRequest.invoked = function (options, callback) {
            options.uri.should.equal(uri);
            callback(null, { statusCode: 200 }, null);
        }

        return api.getBuildDefinitions('account', 'project');
    });

    it('getBuildQueue', function () {
        var uri = 'https://account.visualstudio.com/defaultcollection/project/_apis/build/queues/1?api-version=1.0';
        var api = new vs.Client({ access_token: 'token' });
        
        httpRequest.invoked = function (options, callback) {
            options.uri.should.equal(uri);
            callback(null, { statusCode: 200 }, null);
        }
        
        return api.getBuildQueue('account', 'project', 1);
    });
    
    it('getBuildQueues', function () {
        var uri = 'https://account.visualstudio.com/defaultcollection/project/_apis/build/queues?api-version=1.0';
        var api = new vs.Client({ access_token: 'token' });
        
        httpRequest.invoked = function (options, callback) {
            options.uri.should.equal(uri);
            callback(null, { statusCode: 200 }, null);
        }
        
        return api.getBuildQueues('account', 'project');
    });
    
    it('getBuildQualities', function () {
        var uri = 'https://account.visualstudio.com/defaultcollection/project/_apis/build/qualities?api-version=1.0';
        var api = new vs.Client({ access_token: 'token' });
        
        httpRequest.invoked = function (options, callback) {
            options.uri.should.equal(uri);
            callback(null, { statusCode: 200 }, null);
        }
        
        return api.getBuildQualities('account', 'project');
    });
    
    it('addBuildQuality', function () {
        var uri = 'https://account.visualstudio.com/defaultcollection/project/_apis/build/qualities/new-quality?api-version=1.0';
        var api = new vs.Client({ access_token: 'token' });
        
        httpRequest.invoked = function (options, callback) {
            options.method.should.equal('PUT');
            options.uri.should.equal(uri);
            
            callback(null, { statusCode: 200 }, null);
        }
        
        return api.addBuildQuality('account', 'project','new-quality');
    });
    
    it('deleteBuildQuality', function () {
        var uri = 'https://account.visualstudio.com/defaultcollection/project/_apis/build/qualities/new-quality?api-version=1.0';
        var api = new vs.Client({ access_token: 'token' });
        
        httpRequest.invoked = function (options, callback) {
            options.method.should.equal('DELETE');
            options.uri.should.equal(uri);
            
            callback(null, { statusCode: 200 }, null);
        }
        
        return api.deleteBuildQuality('account', 'project', 'new-quality');
    });

    it('getBuildRequests', function () {
        var uri = 'https://account.visualstudio.com/defaultcollection/project/_apis/build/requests?api-version=1.0';
        var api = new vs.Client({ access_token: 'token' });
        
        httpRequest.invoked = function (options, callback) {
            options.uri.should.equal(uri);
            callback(null, { statusCode: 200 }, null);
        }
        
        return api.getBuildRequests('account', 'project');
    });
});

describe('Work Items', function () {
    
    it('getWorkItem', function () {
        var uri = 'https://account.visualstudio.com/defaultcollection/_apis/wit/workitems/1?$expand=all&api-version=1.0';
        var api = new vs.Client({ access_token: 'token' });
        
        httpRequest.invoked = function (options, callback) {
            options.uri.should.equal(uri);
            callback(null, { statusCode: 200 }, null);
        }
        
        return api.getWorkItem('account', 1, { $expand: 'all' });
    });

    it('getWorkItemDefaults', function () {
        var uri = 'https://account.visualstudio.com/defaultcollection/project/_apis/wit/workitems/$Task?api-version=1.0';
        var api = new vs.Client({ access_token: 'token' });
        
        httpRequest.invoked = function (options, callback) {
            options.uri.should.equal(uri);
            callback(null, { statusCode: 200 }, null);
        }
        
        return api.getWorkItemDefaults('account', 'project', 'Task');
    });

    it('createWorkItem', function () {
        var uri = 'https://account.visualstudio.com/DefaultCollection/project/_apis/wit/workitems/$Task?api-version=1.0';
        var api = new vs.Client({ access_token: 'token' });
        
        httpRequest.invoked = function (options, callback) {
            options.uri.should.equal(uri);
            callback(null, { statusCode: 200 }, null);
        }
        
        return api.getWorkItemDefaults('account', 'project', 'Task');
    });
});