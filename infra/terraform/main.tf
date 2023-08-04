data "azurerm_resource_group" "openai" {
  name = "ET-NPD-OpenAI"
}

data "azurerm_client_config" "current" {}
