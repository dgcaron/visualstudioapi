var assert = require('assert');
var should = require('should');

var token = require('./token.json');
var vs = require('../vs-client.js');

describe('Visual Studio API Integration', function() {
    it('CanGetProfile', function() {
        // Arrange
        var api = new vs.Client(token);
        // Act
        return api.getProfile().then(function (result) {
            var profile = result.data;
            assert.ok(profile);
            profile.should.have.property('displayName');
        });
    })

    it('CanGetAccounts', function() {
        // Arrange
        var api = new vs.Client(token);
        
        // Act
        return api.getProfile().then(function (result) {
            var profile = result.data;
            return api.getAccountsByOwner(profile.id);
        }).then(function (result) {
            var accounts = result.data;
            acccounts.should.have.property('count');
            acccounts.should.have.property('value');
        });
    })
    
    it('CanGetProjects', function () {
        // Arrange
        var api = new vs.Client(token);
        
        // Act
        return api.getProfile().then(function (result) {
            var profile = result.data;
            return api.getAccountsByOwner(profile.id);
        }).then(function (result) {
            var account = result.data.value[0];
            return api.getProjects(account.accountName, { $take: 1 });
        }).then(function (result) {
            var projects = result.data;
            projects.should.have.property('count');
            projects.should.have.property('value');
        });
    })
   
})
