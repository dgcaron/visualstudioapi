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

VisualStudio.Tokens.prototype.callService = function (method, uri, data) {
    
    var self = this;
    return new RSVP.Promise(function (resolve, reject) {
        var request = require('request');
        request({
            method: method,
            uri: uri,
            headers: self.headers,
            form: data
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

VisualStudio.Tokens.prototype.getToken = function (assertion) {
    var data = this.createPayload("urn:ietf:params:oauth:grant-type:jwt-bearer", assertion);
    return this.callService("POST", this.tokenUrl, data);
 };

VisualStudio.Tokens.prototype.renewToken = function (assertion) {
    var data = this.createPayload("refresh_token", assertion);
    return this.callService("POST", this.tokenUrl, data);
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
        
        options = options || {};
        options['api-version'] = VisualStudio.Version;
        
        var uri = URI.expand("https://app.vssps.visualstudio.com/_apis/{section}", {
            section: section
        }).query(options);
        
        uri = URI.decodeQuery(uri);
        
        return uri.toString();
    }
    
    this.buildScopedUrl = function (account, section, options) {
        options = options || {};
        options['api-version'] = VisualStudio.Version;
        
        var uri = URI.expand("https://{account}.visualstudio.com/defaultcollection/_apis/{section}", {
            account: account,
            section: section
        }).query(options);
        
        uri = URI.decodeQuery(uri);
        
        return uri.toString();
    }

    this.buildProjectScopedUrl = function (account, project, section, options) {
        options = options || {};
        options['api-version'] = VisualStudio.Version;
        
        var uri = URI.expand("https://{account}.visualstudio.com/defaultcollection/{project}/_apis/{section}", {
            account: account,
            project: project,
            section: section
        }).query(options);
        
        uri = URI.decodeQuery(uri);
        
        return uri.toString();
    }
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

VisualStudio.Client.prototype.getProject = function (account, project, options) {
    var uri = this.buildScopedUrl(account, 'projects/'+ project, options);
    return this.callService("GET", uri);
};

// BUILDS
VisualStudio.Client.prototype.getBuild = function (account, project, buildId, options) {
    var uri = this.buildProjectScopedUrl(account, project, 'build/builds/'+buildId , options);
    return this.callService("GET", uri);
};

VisualStudio.Client.prototype.getBuildDetail = function (account, project, buildId, options) {
    var uri = this.buildProjectScopedUrl(account, project, 'build/builds/' + buildId + '/details' , options);
    return this.callService("GET", uri);
};

VisualStudio.Client.prototype.getBuilds = function (account, project, options) {
    var uri = this.buildProjectScopedUrl(account, project, 'build/builds' , options);
    return this.callService("GET", uri);
};

VisualStudio.Client.prototype.getBuildDefinition = function (account, project, build, options) {
    var uri = this.buildProjectScopedUrl(account, project, 'build/definitions/' + build , options);
    return this.callService("GET", uri);
};


VisualStudio.Client.prototype.getBuildDefinitions = function (account, project, options) {
    var uri = this.buildProjectScopedUrl(account, project, 'build/definitions' , options);
    return this.callService("GET", uri);
};


exports.Client = VisualStudio.Client;
exports.Tokens = VisualStudio.Tokens;
