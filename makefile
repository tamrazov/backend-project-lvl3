install:
	npm ci

publish:
	npm publish --dry-run

lint:
	npx eslint .

test:
	npm test

test-debug:
	DEBUG=nock.*,axios npm test

test-coverage:
	npm test -- --coverage --coverageProvider=v8
