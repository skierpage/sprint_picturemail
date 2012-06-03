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
var consume = function consume(obj, key) {
  var result;
  if (obj.hasOwnProperty(key)) {
    result = obj[key];
    delete obj[key];
  } else {
    console.warn(key, " not in albumInfo?!");
  }
  return result;
};

var albumDatum = function albumDatum(key, shouldBe, print) {
  var result = consume(ai, key);
  
  if (shouldBe !== undefined && result !== shouldBe) {
    console.warn("Unexpected album info: ", key, " is ", result, " (not", shouldBe, ")");
  } else if (print === 'print') {
    console.info(key, " is ", result);
  }
  return result;
};

// starts with {"imageCount":95,"totalMediaItems":127,"mediaIndex":null,"offset":null,

albumDatum("imageCount", undefined, "print");
var totalMediaItems = albumDatum("totalMediaItems",  undefined, "print");
albumDatum("mediaIndex", null);
albumDatum("offset", null);

// then the rest is a Results array with an entry for each picture or video.
var elements = albumDatum("Results");
if (! (elements && elements.constructor === Array)) {
  console.error("album info.Results is not an array, exiting!");
  process.exit(1);
}

var len = elements.length;
if (len !== totalMediaItems ) {
  console.warn("album length ", len, " doesn't match totalMediaItems ", totalMediaItems);
}
if (len < 1 ) {
  console.warn("album only has ", len, " elements");
}

var count = 0;
var element, containerID, albumName;
var photoDirectoryName;
while ((element = elements.shift())) {
  // containerID and albumName should be the same for all elements in one album.
  if (count === 0) {
    containerID = element.containerID;
    albumName = element.albumName;
    // the unZIPped directory name is just the albumName with "_1" appended.
    photoDirectoryName = albumName + "_1";
    var stats;
    try {
      stats = fs.lstatSync(photoDirectoryName);
    } catch (e) {
      console.warn("error lstat'ing ", photoDirectoryName, ": ", e.message);
    }
    if (! (stats &&  stats.isDirectory())) {
      console.warn("album does not have a corresponding photo directory named ", photoDirectoryName);
    }
  } else {
    if (element.containerID !== containerID) {
      console.warn("element ", count, " has different containerID (", element.containerID, ") than initial (", containerID, ")");
    }
    if (element.albumName !== albumName) {
      console.warn("element ", count, " has different albumName (", element.albumName, ") than initial (", albumName, ")");
    }
  }

/*
For each element in ResultsArray

    warn if containerID different than before (they're all in the same album)
    warn if hasTransform not false
    use mediaType and mimeType to determine the  elementExtension in the downloaded ZIP file
        mimeType: "image\/jpeg" (note backslash...?)  => .jpeg
        mimeType: "video\/3gpp2" => .mov also
        mimeType: "video\/mp4v-es" => .mov
        warn if anything else
    warn if the file photoDirectoryName/elementID.elementExtension does not exist
    parse creationDate and spit it out as a command to update the picture file: `touch --no-create --date=creationDate directoryName/elementID.elementExtension`
    if there's a description, rename the picture file to append it: `mv -i directoryName/elementID.elementExtension directoryName/elementID description.elementExtension
    warn if audioContainerID not null, hasVoiceCaption not "false", audioElmtID not blank.
    for URL struct
        warn if URL.audio is not blank
        ? ignore thumb?
        if mediaType is "VIDEO" and URL.image is non-blank, e.g. /m/NNNNNNNN_0.mp4v-es?iconifyVideo=true&outquality=56 then either download or spit out a link to it removing the outquality parameter and the _0 (size) before the extension.
 */
  count++;
}

// There should be nothing left!
if (Object.keys(ai).length !== 0) {
  console.warn("At end, still stuff in ai", ai);
} else {
  console.info("At end, nothing left in ai (good!)");
}
