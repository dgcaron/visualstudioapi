var visualstudio = require("visualstudio-client");

var createTokenClient = function (appSettings) {
    var clientSettings = {
        "clientId": appSettings.vsclient_assertion,
        "redirectUrl": appSettings.vsredirect_uri, 
        "tokenUrl": appSettings.vstoken_uri
    };
    return new visualstudio.Tokens(clientSettings);
}

exports.get = function (request, response) {
    var authorizations = request.service.tables.getTable('authorizations');
    var appSettings = request.service.config.appSettings;
    
    // get tokens service
    var tokens = createTokenClient(appSettings);
    tokens.getToken(request.query.code).then(function (result){
        if (result.data) {
            var token = result.data;
            if (token.expires_in) {
                var now = new Date();
                var expires_on = new Date(now.getTime() + (token.expires_in * 1000));
                
                var auth = {
                    "user": request.query.state,
                    "token_type": token.token_type,
                    "access_token": token.access_token,
                    "refresh_token": token.refresh_token,
                    "expires_on": expires_on.getTime()
                };
                
                authorizations.insert(auth);
                response.send(statusCodes.OK, {});
            }
        }
        else { 
            response.send(result.statusCode, {});
        }
    });
};

exports.put = function (request, response) {
    var authorizations = request.service.tables.getTable('authorizations');
    var appSettings = request.service.config.appSettings;
    
    // get tokens service
    var tokens = createTokenClient(appSettings);

    authorizations.where({ user: request.user.userId })
        .read({
        success: function (results) {
            if (results) {
                var staleToken = results[0];
                
                // if another process has updated the token, return that token
                if (staleToken.expires_in > 15) {
                    response.send(statusCodes.OK, staleToken);
                    return;
                }
                
                tokens.renewToken(staleToken.refresh_token).then(function (result) {
                    if (result.data) {
                        var token = result.data;
                        if (token.expires_in) {
                            var now = new Date();
                            var expires_on = new Date(now.getTime() + (token.expires_in * 1000));
                            
                            staleToken.access_token = token.access_token;
                            staleToken.refresh_token = token.refresh_token;
                            staleToken.expires_on = expires_on.getTime();
                            
                            authorizations.update(staleToken);
                            
                            response.send(statusCodes.OK, staleToken);
                        }
                    }
                }, function (data) {
                    response.send(data.statusCode, {});
                });
            }
        }
    });
}
