resource "azurerm_service_plan" "openai" {
  name                = "et-npd-openai-asp"
  resource_group_name = data.azurerm_resource_group.openai.name
  location            = data.azurerm_resource_group.openai.location
  os_type             = "Linux"
  sku_name            = "B1"
}

resource "azurerm_linux_web_app" "openai" {
  name                = "et-npd-openai-wapp"
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
    AZURE_COSMOSDB_URI               = azurerm_cosmosdb_account.openai.endpoint
    AZURE_COSMOSDB_KEY               = azurerm_cosmosdb_account.openai.primary_key
    AZURE_OPENAI_API_KEY             = var.AZURE_OPENAI_API_KEY
    AZURE_OPENAI_API_INSTANCE_NAME   = "et-npd-openai"
    AZURE_OPENAI_API_DEPLOYMENT_NAME = "et-gpt"
    AZURE_OPENAI_API_VERSION         = "2021-08-04-preview"
    NEXTAUTH_SECRET                  = "etnpdopenaitokenunique"
    NEXTAUTH_URL                     = "https://et-npd-openai-wapp.azurewebsites.net"
  }
}