// From http://stackoverflow.com/questions/9536516/get-a-cookie-with-nodejs
var request = require("request");

console.log('about to require optimist...');

// from https://github.com/substack/node-optimist
var argv = require('optimist')
    .usage('Contacts Sprint Picture Mail and downloads your stuff into "pictures" subdirectory.\nUsage: $0 -u YOURPHONENUM -p YOURPASSWD')
    .demand(['u','p'])
    .alias('u', 'username')
    .describe('u', 'your Sprint Picture Mail login, usually your phone number e.g. 555-555-1234')
    .alias('p', 'password')
    .describe('p', 'your Sprint Picture Mail password')
    .argv;

/*
 * In normal login, you visit https://pictures.sprintpcs.com/login.do?specialLogin=true
 * The form there submits to /authenticate.jsp
 * %$#@! Firebug panel goes away comes back on a non-https 
 * ==> How do I get a persistent net trace? Try Firefox?
 * somehow winds up on  http://pictures.sprintpcs.com/pictureMail/myMedia.do?cf=1
 * Before this it
 * 1.  makes a request to
 *   https://pictures.sprintpcs.com/webCheckUserAjax.do?devicelogin=USERNAME&firsttimeuser=no&handler=login&isAjaxCall=true&key=reg&login=USERNAME&loginType=web-login&password=PASSWD&resource=%2Fssleaterpage.jsp&retailerid=SPRINTPCS&specialLogin=true&subretailerid=PCSNEXTEL&x=35&y=10
 *  ?? maybe it's a POST request? Firefox says:
 *   [18:09:53.361] POST https://pictures.sprintpcs.com/webCheckUserAjax.do [HTTP/1.1 200 OK 395ms]
 *   The response to Firefox is to set a cookie
 *      pmjsessionid=aXggw2wIY2bd; domain=.sprintpcs.com; path=/
 * 2. seems to decide things are OK, and does a GET of
 *      https://pictures.sprintpcs.com/pictureMail/myMedia.do?cf=1 [HTTP/1.1 302 Found 12ms]
 *   which does a 302 redirect to
 *      http://pictures.sprintpcs.com/pictureMail/myMedia.do?cf=1 [HTTP/1.1 200 OK 70ms]
 * I tried a calling authenticate.jsp with these parameters: that returns a cookie
 *   Set-Cookie: pmjsessionid=a4wfk1bwY8La; domain=.sprintpcs.com; path=
 * and a script to test if cookies set.
 * Try the 
 */
var spmURLs = {
               // try removing mode=firttimeusers and isAjaxCall=true , doesn't seem to work any better.
               authenticate: "https://pictures.sprintpcs.com/login.do?password=PASSWORD&handler=login&login=USERNAME&loginType=web-login&devicelogin=USERNAME&firsttimeuser=no&resource=%2Fssleaterpage.jsp&key=reg&specialLogin=true",
               // This is a page that lynx authenticate seems to go to, doesn't work
               failingLogin: "https://pictures.sprintpcs.com/login.do?password=PASSWORD&handler=login&login=USERNAME&loginType=web-login&mode=firttimeuser&devicelogin=USERNAME&firsttimeuser=no&resource=%2Fssleaterpage.jsp&key=reg&isAjaxCall=true&specialLogin=true",
               failingAuthenticate2: "https://pictures.sprintpcs.com/webCheckUserAjax.do?devicelogin=USERNAME&firsttimeuser=no&handler=login&isAjaxCall=true&key=reg&login=USERNAME&loginType=web-login&password=PASSWD&resource=%2Fssleaterpage.jsp&retailerid=SPRINTPCS&specialLogin=true&subretailerid=PCSNEXTEL",
               failingAuthenticate: "https://pictures.sprintpcs.com/authenticate.jsp?devicelogin=USERNAME&firsttimeuser=no&handler=login&isAjaxCall=true&key=reg&login=USERNAME&loginType=web-login&password=PASSWORD&resource=%2Fssleaterpage.jsp&retailerid=SPRINTPCS&specialLogin=true&subretailerid=PCSNEXTEL",
               interactive:  "http://pictures.sprintpcs.com/pictureMail/myMedia.do?cf=1",
               allAlbums:    "http://pictures.sprintpcs.com/ajax/view/getAlbumListResults.do?sortCode=5"
              };

// request module enables cookies by default
function initiate() {
  // request({url: authenticateURL, qs: {j_username: "jasperadmin", j_password: "jasperadmin"}}, ...)
  var authURL = spmURLs.authenticate.replace(/USERNAME/g, argv.username).replace(/PASSWORD/g, argv.password);
  console.log("about to try authURL=", authURL);

  request(authURL, function(err, res, body) {
    if(err) {
      return console.error(err);
    }

    console.log("Got authenticate response for", res);
    console.log("authenticate response body:", body);

    /* Hard to tell if spmURLs.interactive works, it's so dependent on JavaScript...
     * (key seems to be that if the text has "We apologize for the inconvenience",
     * then the login didn't take).
     */

    console.log("Onto the next request, for ", spmURLs.allAlbums);
    request.get(spmURLs.allAlbums, function(err, res, body) {
      if(err) {
        return console.error(err);
      }

      console.log("Got allAlbums response!", res);
      console.log("allAlbums Response body:", body);
    });
  });
}

initiate();
