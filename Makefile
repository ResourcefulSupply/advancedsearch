app_name=$(notdir $(CURDIR))
source_build_directory=$(CURDIR)/build/artifacts/source
source_package_name=$(source_build_directory)/$(app_name)
appstore_build_directory=$(CURDIR)/build/artifacts/appstore
appstore_package_name=$(appstore_build_directory)/$(app_name)

.PHONY: all
all: npm-prod

npm-prod:
	npm run build

# Removes the appstore build
.PHONY: clean
clean:
	rm -rf ./build

# Same as clean but also removes dependencies installed by npm
.PHONY: distclean
fullclean: clean
	rm -rf vendor
	rm -rf node_modules
	rm -rf js/vendor
	rm -rf js/node_modules

.PHONY: test
test:
	npm run test

# Builds the source and appstore package
.PHONY: dist
dist:
	make source

# Builds the source package
.PHONY: source
source:
	rm -rf $(source_build_directory)
	mkdir -p $(source_build_directory)
	tar cvzf ${source_package_name}.tar.gz \
	--exclude-vcs \
	--exclude="../$(app_name)/.git" \
	--exclude="../$(app_name)/build" \
	--exclude="../$(app_name)/js/node_modules" \
	--exclude="../$(app_name)/node_modules" \
	--exclude="../$(app_name)/*.log" \
	--exclude="../$(app_name)/js/*.log" \
	../$(app_name)

# Builds the package for the appstore
appstore:
	rm -rf $(appstore_build_directory)
	mkdir -p $(appstore_build_directory)
	tar cvzf ${appstore_package_name}.tar.gz \
	--exclude-vcs \
	--exclude="../$(app_name)/.git" \
	--exclude="../$(app_name)/Makefile" \
	--exclude="../$(app_name)/package.json" \
	--exclude="../$(app_name)/package-lock.json" \
	--exclude="../$(app_name)/webpack.config.js" \
	--exclude="../$(app_name)/babel.config.js" \
	--exclude="../$(app_name)/src" \
	--exclude="../$(app_name)/build" \
	--exclude="../$(app_name)/js/node_modules" \
	--exclude="../$(app_name)/node_modules" \
	--exclude="../$(app_name)/*.log" \
	--exclude="../$(app_name)/js/*.log" \
	../$(app_name)
