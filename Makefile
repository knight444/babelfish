PATH        := $(shell pwd)/node_modules/.bin:${PATH}

NPM_PACKAGE := $(shell node -e 'console.log(require("./package.json").name)')
NPM_VERSION := $(shell node -e 'console.log(require("./package.json").version)')

TMP_PATH    := /tmp/${NPM_PACKAGE}-$(shell date +%s)

REMOTE_NAME ?= origin
REMOTE_REPO ?= $(shell git config --get remote.${REMOTE_NAME}.url)

CURR_HEAD   := $(firstword $(shell git show-ref --hash HEAD | cut --bytes=-6) master)
GITHUB_PROJ := nodeca/${NPM_PACKAGE}


test-all: lint test


lint:
	eslint --reset ./


test: lint
	@if test ! `which mocha` ; then \
		echo "You need 'mocha' installed in order to run tests." >&2 ; \
		echo "  $ npm install" >&2 ; \
		exit 128 ; \
		fi
	NODE_ENV=test mocha


doc:
	@if test ! `which ndoc` ; then \
		echo "You need 'ndoc' installed in order to generate docs." >&2 ; \
		echo "  $ npm install -g ndoc" >&2 ; \
		exit 128 ; \
		fi
	rm -rf ./doc
	ndoc --link-format "{package.homepage}/blob/${CURR_HEAD}/{file}#L{line}"


gh-pages:
	@if test -z ${REMOTE_REPO} ; then \
		echo 'Remote repo URL not found' >&2 ; \
		exit 128 ; \
		fi
	$(MAKE) doc && \
		cp -r ./doc ${TMP_PATH} && \
		touch ${TMP_PATH}/.nojekyll
	cd ${TMP_PATH} && \
		git init && \
		git add . && \
		git commit -q -m 'Recreated docs'
	cd ${TMP_PATH} && \
		git remote add remote ${REMOTE_REPO} && \
		git push --force remote +master:gh-pages 
	rm -rf ${TMP_PATH}


parser:
	@if test ! `which pegjs` ; then \
		echo "You need 'pegjs' installed in order to compile parser." >&2 ; \
		echo "  $ npm install" >&2 ; \
		exit 128 ; \
	fi
	pegjs -o size src/parser.pegjs lib/babelfish/parser.js


browserify:
	rm -rf ./dist
	mkdir dist
	# Browserify
	( echo -n "/* ${NPM_PACKAGE} ${NPM_VERSION} ${GITHUB_PROJ} */" ; \
		browserify -r ./ -s Babelfish \
		) > dist/babelfish.js
	# Minify
	uglifyjs dist/babelfish.js -c -m \
		--preamble "/* ${NPM_PACKAGE} ${NPM_VERSION} ${GITHUB_PROJ} */" \
		> dist/babelfish.min.js


publish:
	@if test 0 -ne `git status --porcelain | wc -l` ; then \
		echo "Unclean working tree. Commit or stash changes first." >&2 ; \
		exit 128 ; \
		fi
	@if test 0 -ne `git fetch ; git status | grep '^# Your branch' | wc -l` ; then \
		echo "Local/Remote history differs. Please push/pull changes." >&2 ; \
		exit 128 ; \
		fi
	@if test 0 -ne `git tag -l ${NPM_VERSION} | wc -l` ; then \
		echo "Tag ${NPM_VERSION} exists. Update package.json" >&2 ; \
		exit 128 ; \
		fi
	git tag ${NPM_VERSION} && git push origin ${NPM_VERSION}
	npm publish https://github.com/${GITHUB_PROJ}/tarball/${NPM_VERSION}

todo:
	grep 'TODO' -n -r ./lib 2>/dev/null || test true


.PHONY: lint test doc dev-deps gh-pages todo
.SILENT: lint test doc todo
