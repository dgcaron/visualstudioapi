// safeguard added to be able to test the scripts
var exports = exports || {};

// define visual studio namespace
var VisualStudio = VisualStudio || {};

// load the depencies
var RSVP = require('rsvp');
var URI = require('URIjs');
var URITemplate = require('URIjs/src/URITemplate');

VisualStudio.Version = "1.0";

VisualStudio.Tokens = function (options) {
    
    this.clientId = options.clientId;
    this.redirectUrl = options.redirectUrl;
    this.tokenUrl = options.tokenUrl;
    
    this.headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
    
    this.createPayload = function (grant_type, assertion) {
        var data = {
            "client_assertion_type": "urn:ietf:params:oauth:client-assertion-type:jwt-bearer",
            "client_assertion": this.clientId,
            "grant_type": grant_type,
            "assertion": assertion,
            "redirect_uri": this.redirectUrl
        };
        
        return data;
    };
};

VisualStudio.Client = function (token) {
    
    this.token = token;
    this.baseUrl = "https://app.vssps.visualstudio.com/";
    this.accountBaseUrl = "https://{account}.visualstudio.com/defaultcollection/_apis/{section}";
      
    this.headers = {
        'Content-Type': 'application/json',
        'Authorization': 'bearer ' + this.token.access_token
    };
    
    this.buildUnscopedUrl = function (section, options) {
        
        options = options || { };
        options['api-version'] = VisualStudio.Version;

        var uri = URI.expand("https://app.vssps.visualstudio.com/_apis/{section}", {
            section: section
        }).query(options);
        
        uri = URI.decodeQuery(uri);
        
        return uri.toString();
    }

    this.buildScopedUrl = function (account, section, options)  {
        options = options || {};
        options['api-version'] = VisualStudio.Version;

        var uri = URI.expand("https://{account}.visualstudio.com/defaultcollection/_apis/{section}", {
            account: account,
            section: sections
        }).query(options);
        
        uri = URI.decodeQuery(uri);
        
        return uri.toString();
    }
};

VisualStudio.Tokens.prototype.getToken = function (request) {
    var httpRequest = require('request');
    
    var self = this;
    return new RSVP.Promise(function (resolve, reject) {
        httpRequest.post(
        {
            uri: this.tokenUrl,
            headers: this.headers,
            form: this.createPayload("urn:ietf:params:oauth:grant-type:jwt-bearer", request.assertion)
        }, 
        function (error, response, body) {
            if (!error && response.statusCode == 200) {
                resolve(JSON.parse(body));
            }
            else {
                reject(error);
            }
        });
    });
};

VisualStudio.Tokens.prototype.renewToken = function (assertion) {
    var httpRequest = require('request');
    var self = this;
    return new RSVP.Promise(function (resolve, reject) {
        httpRequest.post({
            uri: self.tokenUrl,
            headers: self.headers,
            form: self.createPayload("refresh_token", assertion)
        }, 
        function (error, response, body) {
            if (!error && response.statusCode == 200) {
                resolve(JSON.parse(body));
            }
            else {
                reject(error);
            }
        });
    });
};

VisualStudio.Client.prototype.callService = function (method, uri, data) {
    
    var self = this;
    return new RSVP.Promise(function (resolve, reject) {
        var request = require('request');
        request({
            method: method,
            uri: uri,
            headers: self.headers
        },
         function (error, response, body) {
            var result = {
                statusCode: response.statusCode,
                data : null,
                error: error
            };

            if (!error && response.statusCode == 200) {
                result.data = JSON.parse(body);
                resolve(result);
            }
            else {
                reject(result);
            }
        });
    });
}

VisualStudio.Client.prototype.getProfile = function () {
    var uri = this.buildUnscopedUrl('profile/profiles/me');
    return this.callService("GET", uri);
};

VisualStudio.Client.prototype.getAccountsByMember = function (memberId) {
    var uri = this.buildUnscopedUrl('Accounts', { memberId : memberId });
    return this.callService("GET", uri);
};

VisualStudio.Client.prototype.getAccountsByOwner = function (ownerId) {
    var uri = this.buildUnscopedUrl('Accounts', {ownerId : ownerId});
    return this.callService("GET", uri);
};

VisualStudio.Client.prototype.getProjects = function (account, options) {
    var uri = this.buildScopedUrl(account, 'projects', options);
    return this.callService("GET", uri);
};

VisualStudio.Client.prototype.getProject = function (account,project, options) {
    var uri = this.buildScopedUrl(account, 'projects/'+ project, options);
    return this.callService("GET", uri);
};

exports.Client = VisualStudio.Client;
exports.Tokens = VisualStudio.Tokens;
