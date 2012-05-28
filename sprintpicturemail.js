// From http://stackoverflow.com/questions/9536516/get-a-cookie-with-nodejs
var request = require("request");

/*
 * In normal login, you visit https://pictures.sprintpcs.com/login.do?specialLogin=true
 * The form there submits to /authenticate.jsp
 * %$#@! Firebug panel goes away comes back on a non-https 
 * http://pictures.sprintpcs.com/pictureMail/myMedia.do?cf=1
 * Before this it
 * 1.  makes a request to
 *   https://pictures.sprintpcs.com/webCheckUserAjax.do?devicelogin=555-555-1234&firsttimeuser=no&handler=login&isAjaxCall=true&key=reg&login=555-555-1234&loginType=web-login&password=PASSWD&resource=%2Fssleaterpage.jsp&retailerid=SPRINTPCS&specialLogin=true&subretailerid=PCSNEXTEL&x=35&y=10
 *  ?? maybe it's a POST request? Firefox says:
 *   [18:09:53.361] POST https://pictures.sprintpcs.com/webCheckUserAjax.do [HTTP/1.1 200 OK 395ms]
 *   The response to Firefox is to set a cookie
 *      pmjsessionid=aXggw2wIY2bd; domain=.sprintpcs.com; path=/
 * 2. seems to decide things are OK, and does a GET of
 *      https://pictures.sprintpcs.com/pictureMail/myMedia.do?cf=1 [HTTP/1.1 302 Found 12ms]
 *   which does a 302 redirect to
 *      http://pictures.sprintpcs.com/pictureMail/myMedia.do?cf=1 [HTTP/1.1 200 OK 70ms]
 * So....
 *   Maybe try calling authenticate.jsp with these params.
 *   ... I tried a call with bad phone and password, and that just returns a cookie
 *      Set-Cookie: pmjsessionid=a4wfk1bwY8La; domain=.sprintpcs.com; path=
 *   and a script to test if cookies set.
 *   ? maybe remove isAjaxCall=true
 */
var authenticateURL = "https://pictures.sprintpcs.com/authenticate.jsp?devicelogin=555-555-1234&firsttimeuser=no&handler=login&isAjaxCall=true&key=reg&login=555-555-1234&loginType=web-login&password=PASSWD&resource=%2Fssleaterpage.jsp&retailerid=SPRINTPCS&specialLogin=true&subretailerid=PCSNEXTEL";

/* Hard to tell if this works, it's so dependent on JavaScript...
 * key seems to be that if the text has "We apologize for the inconvenience", the login didn't take. */
var interactiveSPMUrl = "http://pictures.sprintpcs.com/pictureMail/myMedia.do?cf=1";

// request module enables cookies by default
function initiate() {
  // request({url: authenticateURL, qs: {j_username: "jasperadmin", j_password: "jasperadmin"}}, ...)
  request({url: authenticateURL }, function(err, res, body) {
    if(err) {
      return console.error(err);
    }

    console.log("Got initial response!", res);
    console.log("Initial response body:", body);

    console.log("Onto the next request, for ", interactiveSPMUrl);
    request.get(interactiveSPMUrl, function(err, res, body) {
      if(err) {
        return console.error(err);
      }

      console.log("Got interactiveSPMUrl response!", res);
      console.log("interactiveSPMUrl Response body:", body);
    });
  });
}

initiate();
