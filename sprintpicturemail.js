// From http://stackoverflow.com/questions/9536516/get-a-cookie-with-nodejs
var request = require("request");

request.post({url: "http://localhost:8080/jasperserver/rest/login", qs: {j_username: "jasperadmin", j_password: "jasperadmin"}}, function(err, res, body) {
    if(err) {
        return console.error(err);
    }

    request.get("http://localhost:8080/jasperserver/ressource/reports", function(err, res, body) {
        if(err) {
            return console.error(err);
        }

        console.log("Got a response!", res);
        console.log("Response body:", body);
    });
});
