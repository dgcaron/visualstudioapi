(function (root, factory) {
    'use strict';
    if (typeof exports === 'object') {
        // Node. Does not work with strict CommonJS, but 
        // only CommonJS-like environments that support module.exports, 
        // like Node. 
        module.exports.Client = factory(require('request'), require('rsvp'), require('URIjs'), require('URIjs/src/URITemplate', 'node')).Client;
        module.exports.Tokens = factory(require('request'), require('rsvp'), require('URIjs'), require('URIjs/src/URITemplate'.'node')).Tokens;
    } else {
        // Browser globals (root is window) 
        root.VisualStudio = factory($.ajax, root.RSVP, root.URI, root.URITemplate, 'browser');
    }
}(this, function (request, RSVP, URI, URITemplate, mode) {
    //use b in some fashion. 
    
    console.log(request);
    
    // Just return a value to define the module export. 
    // This example returns an object, but the module 
    // can return a function as the exported value. 
    // define visual studio namespace
    var VisualStudio = VisualStudio || {};
    
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
    
    
    VisualStudio.Tokens.prototype.getAuthorizeUrl = function (state, scope) {
        var base = 'https://app.vssps.visualstudio.com/oauth2/authorize';
        var options = {
            client_id: this.clientId,
            response_type: 'Assertion',
            state: state,
            scope: scope,
            redirect_uri: this.redirectUrl
        }
        var uri = URI.expand(base).query(options);
        return uri.toString();
    }
    
    VisualStudio.Tokens.prototype.callService = function (method, uri, data) {
        
        var self = this;
        return new RSVP.Promise(function (resolve, reject) {
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
        
        if (mode == 'node') {
            return new RSVP.Promise(function (resolve, reject) {
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
        
        if (mode == 'browser') { 
            return new RSVP.Promise(function (resolve, reject) {
                request({
                    type : method,
                    url: uri,
                    headers: self.headers,
                    data: data
                }).then(function (data, statusCode, jqXHR) {
                    var result = {
                        statusCode: statusCode,
                        data : JSON.parse(data),
                        error: error
                    };
                    
                    resolve(result);
                    
                }, function (jqXHR, statusCode, error) {
                    var result = {
                        statusCode: statusCode,
                        data : null,
                        error: error
                    };
                    
                    reject(result);
                });
                    
            });
    }
    
    VisualStudio.Client.prototype.getProfile = function () {
        var uri = this.buildUnscopedUrl('profile/profiles/me');
        return this.callService('GET', uri);
    };
    
    VisualStudio.Client.prototype.getAccountsByMember = function (memberId) {
        var uri = this.buildUnscopedUrl('Accounts', { memberId : memberId });
        return this.callService('GET', uri);
    };
    
    VisualStudio.Client.prototype.getAccountsByOwner = function (ownerId) {
        var uri = this.buildUnscopedUrl('Accounts', { ownerId : ownerId });
        return this.callService('GET', uri);
    };
    
    VisualStudio.Client.prototype.getProjects = function (account, options) {
        var uri = this.buildScopedUrl(account, 'projects', options);
        return this.callService('GET', uri);
    };
    
    VisualStudio.Client.prototype.getProject = function (account, project, options) {
        var uri = this.buildScopedUrl(account, 'projects/' + project, options);
        return this.callService('GET', uri);
    };
    
    // BUILDS
    VisualStudio.Client.prototype.getBuilds = function (account, project, options) {
        var uri = this.buildProjectScopedUrl(account, project, 'build/builds' , options);
        return this.callService('GET', uri);
    };
    
    VisualStudio.Client.prototype.getBuild = function (account, project, buildId, options) {
        var uri = this.buildProjectScopedUrl(account, project, 'build/builds/' + buildId , options);
        return this.callService('GET', uri);
    };
    
    VisualStudio.Client.prototype.getBuildDetail = function (account, project, buildId, options) {
        var uri = this.buildProjectScopedUrl(account, project, 'build/builds/' + buildId + '/details' , options);
        return this.callService('GET', uri);
    };
    
    VisualStudio.Client.prototype.addBuild = function (account, project, build) {
        var uri = this.buildProjectScopedUrl(account, project, 'build/requests');
        return this.callService('POST', uri, build);
    };
    
    VisualStudio.Client.prototype.updateBuild = function (account, project, request, status) {
        var uri = this.buildProjectScopedUrl(account, project, 'build/requests/' + request);
        return this.callService('PATCH', uri, status);
    };
    
    VisualStudio.Client.prototype.cancelBuild = function (account, project, request, status) {
        var uri = this.buildProjectScopedUrl(account, project, 'build/requests/' + request);
        return this.callService('DELETE', uri);
    };
    
    VisualStudio.Client.prototype.getBuildDefinition = function (account, project, build, options) {
        var uri = this.buildProjectScopedUrl(account, project, 'build/definitions/' + build , options);
        return this.callService('GET', uri);
    };
    
    VisualStudio.Client.prototype.getBuildDefinitions = function (account, project, options) {
        var uri = this.buildProjectScopedUrl(account, project, 'build/definitions', options);
        return this.callService('GET', uri);
    };
    
    VisualStudio.Client.prototype.getBuildQueue = function (account, project, queue) {
        var uri = this.buildProjectScopedUrl(account, project, 'build/queues/' + queue);
        return this.callService('GET', uri);
    };
    
    VisualStudio.Client.prototype.getBuildQueues = function (account, project) {
        var uri = this.buildProjectScopedUrl(account, project, 'build/queues');
        return this.callService('GET', uri);
    };
    
    VisualStudio.Client.prototype.getBuildRequests = function (account, project) {
        var uri = this.buildProjectScopedUrl(account, project, 'build/requests');
        return this.callService('GET', uri);
    };
    
    VisualStudio.Client.prototype.getBuildQualities = function (account, project) {
        var uri = this.buildProjectScopedUrl(account, project, 'build/qualities');
        return this.callService('GET', uri);
    };
    
    VisualStudio.Client.prototype.addBuildQuality = function (account, project, quality) {
        var uri = this.buildProjectScopedUrl(account, project, 'build/qualities/' + quality);
        return this.callService('PUT', uri);
    };
    
    VisualStudio.Client.prototype.deleteBuildQuality = function (account, project, quality) {
        var uri = this.buildProjectScopedUrl(account, project, 'build/qualities/' + quality);
        return this.callService('DELETE', uri);
    };
    
    // WORK ITEMS
    VisualStudio.Client.prototype.getWorkItem = function (account, workitem, options) {
        var uri = this.buildScopedUrl(account, 'wit/workitems/' + workitem, options);
        return this.callService('GET', uri);
    };
    
    VisualStudio.Client.prototype.getWorkItemDefaults = function (account, project, workItemTypeName) {
        var uri = this.buildProjectScopedUrl(account, project, 'wit/workitems/$' + workItemTypeName);
        return this.callService('GET', uri);
    };
    
    VisualStudio.Client.prototype.workItemField = function (op, path, value) {
        var field = {};
        
        field['op'] = op;
        field['path'] = path;
        field['value'] = value;
        
        return field;
    }
    
    VisualStudio.Client.prototype.workItemRelation = function (op, path, value, url, attributes) {
        var field = {};
        
        field['op'] = op;
        field['path'] = path;
        field['value.rel'] = value;
        field['value.url'] = url;
        field['value.attributes'] = attributes;
        
        return field;
    }
    
    VisualStudio.Client.prototype.createWorkItem = function (account, project, workItemTypeName, data) {
        var uri = this.buildProjectScopedUrl(account, project, 'wit/workitems/$' + workItemTypeName);
        return this.callService('PATCH', uri, data);
    };
    
    return VisualStudio;
}));



