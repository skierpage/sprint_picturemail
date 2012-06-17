# Makefile, mostly turns .js into bookmarklet

NODE_BIN=./node_modules/.bin
UGLIFY=$(NODE_BIN)/uglifyjs
JSHINT=$(NODE_BIN)/jshint
JSONLINT=$(NODE_BIN)/jsonlint 

ECHO=/bin/echo
DOC_DIR:=docs


# To make a bookmarklet, compact the .js and prepend javascript:
# If the script is small you could just copy and paste it into your browser
# and prepend javascript: yourself
%.bookmarklet : %.js
	$(UGLIFY) $< | sed 's/^/javascript:/' > $@
