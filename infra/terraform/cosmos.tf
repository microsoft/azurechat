resource "azurerm_cosmosdb_account" "openai" {
  name                = "et-npd-openai-cosmos"
  resource_group_name = data.azurerm_resource_group.openai.name
  location            = data.azurerm_resource_group.openai.location
  offer_type          = "Standard"
  kind                = "GlobalDocumentDB"

  geo_location {
    location          = data.azurerm_resource_group.openai.location
    failover_priority = 0
  }

  identity {
    type = "SystemAssigned"
  }
  consistency_policy {
    consistency_level       = "BoundedStaleness"
    max_interval_in_seconds = 300
    max_staleness_prefix    = 100000
  }

}