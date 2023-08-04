WORK_DIR:=/expert-thinking
plan=plan

init:
	docker-compose run --rm -w "$(WORK_DIR)" terraform init\
	 	-backend-config="storage_account_name=$(STATE_SA)" \
		-backend-config="subscription_id=$(ARM_SUBSCRIPTION_ID)" \
		-backend-config="container_name=$(CONTAINER)" \
		-backend-config="resource_group_name=$(STATE_SA_RG)" \
		-backend-config="key=$(TFSTATE_KEY).tfstate"

validate: init
	docker-compose run --rm -w "$(WORK_DIR)" terraform validate

plan: init 
	docker-compose run --rm -w "$(WORK_DIR)" terraform plan -out $(plan)

show-json: plan
	docker-compose run --rm -w "$(WORK_DIR)" terraform show -no-color -json $(plan) > plan.json

show-txt:
	docker-compose run --rm -w "$(WORK_DIR)" terraform show $(plan) -no-color > plan.txt
	
infracost: show-json
	docker-compose run --rm -w "$(WORK_DIR)" infracost breakdown --path plan.json

infracost-out: show-json
	docker-compose run --rm -w "$(WORK_DIR)" infracost breakdown --format json --path plan.json --out-file cost.json
	docker-compose run --rm -w "$(WORK_DIR)" infracost output --path cost.json --format github-comment --out-file gh.md

tfsec:
	docker-compose run --rm -w "$(WORK_DIR)" tfsec . --soft-fail

apply: init
	docker-compose run --rm -w "$(WORK_DIR)" terraform apply -auto-approve

cleanup:
	sudo rm plan -f
	sudo rm plan.txt -f