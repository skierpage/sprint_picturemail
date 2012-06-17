Scripts and bookmarklets to assist getting pictures off Sprint Picture Mail

More details in my blog post  http://www.skierpage.com/blog/2012/05/web-automating-bits-of-sprint-picture-mail/

* spm_albums.js is the source for a bookmarklet that processes the JSON for an album list. To use it you have to prepend `javascript:`, see the Makefile
* spm_processmetadata.js is node.js code that reads the .json file for an album's photos and updates each photo with its date and description from the metadata. 

