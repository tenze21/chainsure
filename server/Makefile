# ============================================================
#  Sequelize CLI Helper
#  Usage examples:
#    make migrate-generate name=create-policies-table
#    make seed-generate name=demo-policies
#    make migrate-up
#    make migrate-down
#    make seed-all
# ============================================================

.PHONY: migrate-generate seed-generate

# ------------------------------------------------------------
# Guard: ensures a required variable was passed.
# Usage: $(call require, varname)
# ------------------------------------------------------------
define require
	$(if $($(1)),,$(error Missing argument: $(1). Usage: make $@ $(1)=<value>))
endef


# ------------------------------------------------------------
# Migrations
# ------------------------------------------------------------

## Generate a new migration file
## Usage: make migrate-generate name=<migration-name>
migrate-generate:
	$(call require,name)
	npx sequelize migration:generate --name $(name)


# ------------------------------------------------------------
# Seeds
# ------------------------------------------------------------

## Generate a new seed file
## Usage: make seed-generate name=<seed-name>
seed-generate:
	$(call require,name)
	npx sequelize seed:generate --name $(name)
