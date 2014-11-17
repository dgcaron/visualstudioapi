function read(query, user, request) {
    query.where({ user: user.userId }).select('id', 'access_token', 'refresh_token', 'expires_on');
    request.execute({
        success: function (results) {
            var now = new Date().getTime();
            for (var i = 0; i < results.length; i++) {
                results[i].expires_in = Math.floor((results[i].expires_on - now) / 1000);
            }
            
            request.respond(statusCodes.OK, results);
        }
    });
}