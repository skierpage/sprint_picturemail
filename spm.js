var linkWin = open("", "albums", "width=400,height=200,scrollbars,resizable,menubar");
var lw = linkWin.document;
var isJSON = true;
try {
  albums=JSON.parse(document.body.innerHTML.replace(/\\'/, "'")); // Sprint Picture Mail incorrectly encodes ' as \'
} catch (e) {
  isJSON = false;
}
if (isJSON && typeof albums === 'object' && Array.isArray(albums) && albums.length > 0) {
  baseURL = document.baseURI.match(/(.*?\/\/.*?)\//)[1]; // given http://pictures.sprintpcs.com/foo/bar?baz , this returns http://pictures.sprintpcs.com

  lw.write('<base href="' + baseURL + '" target="_blank">\n');
  lw.write('<ol>\n');
  for (i = 0; i < albums.length; i++) {
    var album = albums[i];
    // XXX should escape " > < & in the text...
    lw.write('  <li>' + album.title.link('/ui-refresh/getMediaContainerJSON.do?componentType=mediaDetail&sortCode=17&containerID=' + album.containerID) + ' - ' + album.coverTitle + '</li>\n\n');
  };
  lw.write('</ol>\n');
} else {
  lw.write('<p>window contents do not appear to be Sprint Picture Mail JSON info</p>\n');
  lw.write('<p>Try visiting <a href="http://pictures.sprintpcs.com/ajax/view/getAlbumListResults.do?sortCode=5">http://pictures.sprintpcs.com/ajax/view/getAlbumListResults.do?sortCode=5</a></p>\n');
}
