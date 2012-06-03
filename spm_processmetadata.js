// Given an album's .json from e.g 
// http://pictures.sprintpcs.com/ui-refresh/getMediaContainerJSON.do?componentType=mediaDetail&sortCode=17&containerID=MMMMMMM
// walk through it and look for missing info.
// Details in http://www.skierpage.com/blog/2012/05/web-automating-bits-of-sprint-picture-mail/
//
// I gave up on performing the login.

/*jshint globalstrict:true */
/*global require:false, console:false, process:false */
"use strict";

// from https://github.com/substack/node-optimist
var argv = require('optimist')
    .usage('Given an album\'s JSON, walks through it looking for missing info and fixing elements.\nUsage: $0 -j albuminfo.json')
    .demand(['j'])
    .alias('j', 'albumjson')
    .describe('j', 'album info retrieved from getMediaContainerJSON.do')
    .argv;

var fs = require('fs');

var ai = JSON.parse(fs.readFileSync(argv.j)); // "albumInfo"

/*
 * We want to walk the Album name.json structure looking for interesting info and warning about unexpected values.
 */

// Utility functions
var checkAndEat = function checkAndEat(objName, obj, key, shouldBe, print) {
  var value;
  if (obj.hasOwnProperty(key)) {
    value = obj[key];
    delete obj[key];
    if (shouldBe !== undefined && value !== shouldBe) {
      console.warn("Unexpected", objName, "info:", key, "is", value, "(not", shouldBe, ")");
    } else if (print === 'print') {
      console.info(objName, key, "is", value);
    }
  } else {
    console.warn(key, "not in", objName, "?!");
  }
  return value;
};


// starts with {"imageCount":95,"totalMediaItems":127,"mediaIndex":null,"offset":null,

checkAndEat("albumInfo", ai, "imageCount", undefined, "print");
var totalMediaItems = checkAndEat("album info", ai, "totalMediaItems",  undefined, "print");
checkAndEat("albumInfo", ai, "mediaIndex", null);
checkAndEat("albumInfo", ai, "offset", null);

// then the rest is a Results array with an entry for each picture or video.
var elements = checkAndEat("albumInfo", ai, "Results");
if (! (elements && elements.constructor === Array)) {
  console.error("album info.Results is not an array, exiting!");
  process.exit(1);
}

var len = elements.length;
if (len !== totalMediaItems ) {
  console.warn("album length", len, "doesn't match totalMediaItems", totalMediaItems);
}
if (len < 1 ) {
  console.warn("album only has", len, "elements");
}

/**
 * Iterate through array of picture/video info.
 */
var i = 0;
var element, containerID, albumName, seenVideoURLs = [];
var photoDirectoryName;
for (i = 0; i < len; i++) {
  var objName = "element[" + i + "]";
  element = elements[i];
  // containerID and albumName should be the same for all elements in one album.
  if (i === 0) {
    containerID = checkAndEat(objName, element, "containerID");
    albumName = checkAndEat(objName, element, "albumName");
    // the unZIPped directory name is just the albumName with "_1" appended.
    photoDirectoryName = albumName + "_1";
    var dirStats;
    try {
      dirStats = fs.lstatSync(photoDirectoryName);
    } catch (e) {
      console.warn("error lstat'ing", photoDirectoryName, ":", e.message);
    }
    if (! (dirStats &&  dirStats.isDirectory())) {
      console.warn("album does not have a corresponding photo directory named ",
                   photoDirectoryName);
    }
  } else {
    if (checkAndEat(objName, element, "containerID") !== containerID) {
      console.warn(objName, "has different containerID than initial (", containerID, ")");
    }
    if (checkAndEat(objName, element, "albumName") !== albumName) {
      console.warn(objName, "has different albumName than initial (", albumName, ")");
    }
  }

  checkAndEat(objName, element, "hasTransform", false);
  var mediaItemNum = checkAndEat(objName, element, "mediaItemNum");
  if (mediaItemNum !== i) {
    console.warn(objName, "has different mediaItemNum (",
                 mediaItemNum, ") than current id", i, "(probably not important)");
  }
  var elementID = checkAndEat(objName, element, "elementID");
  var mediaType = checkAndEat(objName, element, "mediaType");
  if (mediaType !== "VIDEO" && mediaType !== "IMAGE") {
    console.warn("element", i, "has unexpected mediaType", mediaType);
  }
  var mimeType = checkAndEat(objName, element, "mimeType");
  var extension;
  switch(mimeType) {
    case "image\/jpeg":
      extension = ".jpeg";
      break;
    case "video\/3gpp2":
    case "video\/mp4v-es":
      extension = ".mov";
      break;
    default:
      console.warn(objName, "has unexpected mimeType", mimeType);
  }
  var filePath = photoDirectoryName + "/" + elementID + extension;
  var stats = null;
  try {
    stats = fs.statSync(filePath);
  } catch (e) {
    console.warn("error stat'ing", filePath, ":", e.message);
  }
  if (! (stats && stats.isFile())) {
    console.warn(objName, "not found at path", filePath);
  }
  var creationDate = checkAndEat(objName, element, "creationDate");
  if (creationDate !== '') {
    console.warn("   `touch --date='" + creationDate + "' '" + filePath + "'`");
  } else {
    console.warn(objName, "has blank creationDate?!");
  }
  var description = checkAndEat(objName, element, "description");
  if (description !== "") {
    console.warn("  TODO: rename the picture file to append description", description);
    // fs.renameSync(filePath, "directoryName/elementID cleanedDescription.elementExtension");
  }
  checkAndEat(objName, element, "audioContainerID", null);
  checkAndEat(objName, element, "hasVoiceCaption", "false");
  checkAndEat(objName, element, "audioElmtID", "");

  // URL struct
  var urls = checkAndEat(objName, element, "URL");
  var urlsName = objName + ".URL";
  checkAndEat(urlsName, urls, "audio", ""); // always blank!?
  checkAndEat(urlsName, urls, "thumb"); // don't care about thumbnail?
  var imageURL = checkAndEat(urlsName, urls, "image");

  var videoURL = checkAndEat(urlsName, urls, "video");
  /*
      if mediaType is "VIDEO" and URL.image is non-blank, e.g. /m/NNNNNNNN_0.mp4v-es?iconifyVideo=true&outquality=56 then either download or spit out a link to it removing the outquality parameter and the _0 (size) before the extension.
 */
  if (mediaType === "VIDEO" && imageURL !== "" && imageURL !== null) {
    console.warn("TODO: video", filePath, "has a poster image", imageURL);
  }
  // images shouldn't have a videoURL, but SPM has a bug:
  // after it's seen a video it'll spit out that videoURL with slight alterations for subsequent images.
  // e.g. after contenttype=application/x-quicktimeplayer
  // So remember videoURLs...
  if (mediaType === "VIDEO") {
    seenVideoURLs.push(videoURL);
  }
  if (mediaType === "IMAGE" && videoURL !== "" && videoURL !== null) {
    // ... and before warning about an image with a videoURL, see if it's a video we've seen.
    if (seenVideoURLs.indexOf(videoURL) === -1) {
      console.warn("unexpected!!", objName, "is the image", filePath, "but also has a video URL", videoURL);
    } else {
      // console.info("   (SPM bug", objName, "is the image", filePath, "but has the same video URL as", seenVideoURLs.indexOf(videoURL), ")");
    }
  }
  if (Object.keys(urls).length !== 0) {
    console.warn("still stuff in", urlsName, ":", urls);
  }
  // by end, element should be empty.
  if (Object.keys(element).length !== 0) {
    console.warn("still stuff in", objName, ":", element);
  }
}

// There should be nothing left!
if (Object.keys(ai).length !== 0) {
  console.warn("At end, still stuff in albumInfo", ai);
} else {
  console.info("At end, nothing left in albumInfo (good!)");
}
