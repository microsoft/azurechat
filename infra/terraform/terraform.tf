terraform {
  required_version = ">= 1.1.8"
  backend "azurerm" {}
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "3.66.0"
    }
  }
}

provider "azurerm" {
  features {}
}
