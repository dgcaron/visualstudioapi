visualstudioapi
===============

Simple node / javascript class for working with the tokens of the visual studio online api. The api uses RSVP to turn the requests into promises.
This allows you to chain requests

### Single Promise

```javascript
    var api = new vs.Client(token);
    api.getProfile().then(function (result) {
        var profile = result.data;
	    // do something with the profile
    });
```

### Chained Promises

```javascript
    var api = new vs.Client(token);
    api.getProfile().then(function (result) {
        var profile = result.data;
        return api.getAccountsByOwner(profile.id);
    }).then(function (result) {
        var accounts = result.data;
		// do something with the accounts
    });
```


### Roadmap
Section | State
--------------
Tokens | Done
Profile | Done
Accounts | Done
Projects | Done
Builds 	| In Progress
Project Collections | Pending
Teams | Pending
Work Item Tracking | Pending
etc

### Third Party Libraries
RSVP
URIjs
request
mocha
should
proxyquire
