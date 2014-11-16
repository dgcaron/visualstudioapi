visualstudioapi
===============

Simple node / javascript class for working with the tokens of the visual studio online api. The api uses RSVP to turn the requests into promises.
This allows you to chain requests

### Install
```bash
# using npm
npm install visualstudio-client
```

### Single Promise

```javascript
    var visualstudio = require("visualstudio-client");
    var api = new visualstudio.Client(token);
    api.getProfile().then(function (result) {
        var profile = result.data;
	    // do something with the profile
    });
```

### Chained Promises

```javascript
    var visualstudio = require("visualstudio-client");
    var api = new visualstudio.Client(token);
    api.getProfile().then(function (result) {
        var profile = result.data;
        return api.getAccountsByOwner(profile.id);
    }).then(function (result) {
        var accounts = result.data;
		// do something with the accounts
    }).catch(function (error){
    	//handle error from first or second call
    });
```

| Section | State |
--------|--------
| Tokens | Done |
| Profile | Done |
| Accounts | Done |
| Projects | Done |
| Builds | In Progress|
| Project Collections | Pending|
| Teams | Pending|
| Work Item Tracking | Pending|

etc

|Third Party Library | Link |
|---------------------|------|
|RSVP||
|URIjs||
|request||
|mocha||
|should||
|proxyquire||
