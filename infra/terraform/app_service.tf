resource "azurerm_service_plan" "openai" {
  name                = "${var.AZURE_OPENAI_API_INSTANCE_NAME}-asp"
  resource_group_name = data.azurerm_resource_group.openai.name
  location            = data.azurerm_resource_group.openai.location
  os_type             = "Linux"
  sku_name            = "B1"
}

resource "azurerm_linux_web_app" "openai" {
  name                = "${var.AZURE_OPENAI_API_INSTANCE_NAME}-wapp"
  resource_group_name = data.azurerm_resource_group.openai.name
  location            = data.azurerm_resource_group.openai.location
  service_plan_id     = azurerm_service_plan.openai.id

  site_config {
    app_command_line = "node server.js"
    application_stack {
      node_version = "18-lts"
    }
  }

  app_settings = {
    AZURE_COSMOSDB_URI               = replace(azurerm_cosmosdb_account.openai.endpoint, ":443", "")
    AZURE_COSMOSDB_KEY               = azurerm_cosmosdb_account.openai.primary_key
    AZURE_OPENAI_API_KEY             = var.AZURE_OPENAI_API_KEY
    AZURE_OPENAI_API_INSTANCE_NAME   = var.AZURE_OPENAI_API_INSTANCE_NAME
    AZURE_OPENAI_API_DEPLOYMENT_NAME = var.AZURE_OPENAI_API_DEPLOYMENT_NAME
    AZURE_OPENAI_API_VERSION         = var.AZURE_OPENAI_API_VERSION
    NEXTAUTH_SECRET                  = "etnpdopenaitokenunique"
    NEXTAUTH_URL                     = "https://${var.AZURE_OPENAI_API_INSTANCE_NAME}-wapp.azurewebsites.net"
    AUTH_GITHUB_ID                   = var.AUTH_GITHUB_ID
    AUTH_GITHUB_SECRET               = var.AUTH_GITHUB_SECRET
  }
}