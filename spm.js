// fails on badly encoded \' var albums = albums=JSON.parse(document.body.innerHTML);
albums=JSON.parse(document.body.innerHTML.replace(/\\'/, "'"));
linkWin = open("", "albums", "width=400,height=200,scrollbars,resizable,menubar");
// from http://pictures.sprintpcs.com/foo/bar?baz , returns http://pictures.sprintpcs.com
baseURL = document.baseURI.match(/(.*?\/\/.*?)\//)[1];

with (linkWin.document) {
  write('<base href="' + baseURL + '" target="_blank">');
  for (i = 0; i < albums.length; i++) {
    var album = albums[i];
    var text = album.title + ' - ' + album.coverTitle;
    // XXX should escape " > < & in the text...
    // only the last one of these remains in the document, the other stuff is overwritten
    write(text.link('/ui-refresh/getMediaContainerJSON.do?componentType=mediaDetail&sortCode=17&containerID=' + album.containerID) + "<br><br>");
    console.log(text.link('/ui-refresh/getMediaContainerJSON.do?componentType=mediaDetail&sortCode=17&containerID=' + album.containerID) + "<br><br>");
  void close();
  }
};
