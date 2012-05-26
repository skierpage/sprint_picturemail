albums=JSON.parse(document.body.innerHTML.replace(/\\'/, "'")); // Sprint Picture Mail incorrectly encodes ' as \'
linkWin = open("", "albums", "width=400,height=200,scrollbars,resizable,menubar");
lw = linkWin.document;
baseURL = document.baseURI.match(/(.*?\/\/.*?)\//)[1]; // given http://pictures.sprintpcs.com/foo/bar?baz , this returns http://pictures.sprintpcs.com

lw.write('<base href="' + baseURL + '" target="_blank">\n');
lw.write('<ol>\n');
for (i = 0; i < albums.length; i++) {
  var album = albums[i];
  // XXX should escape " > < & in the text...
  lw.write('  <li>' + album.title.link('/ui-refresh/getMediaContainerJSON.do?componentType=mediaDetail&sortCode=17&containerID=' + album.containerID) + ' - ' + album.coverTitle + '</li>\n\n');
};
lw.write('</ol>\n');
