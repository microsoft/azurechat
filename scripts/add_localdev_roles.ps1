###
# This script adds a the required Cosmos DB Data Contributor role to the local user, 
# so you can do local dev connecting to the deployed Azure resources.
# It reads from the APP_URL from the AZD .env file 
# -- otherwise you can set it yourself using -URL https://<appname>.azurewebsites.net

param (
    [string]$URL
)

Write-Host "URL parameter: $URL"

Write-Host "Loading azd .env file from current environment"
$output = azd env get-values
foreach ($line in $output) {
    if (!$line.Contains('=')) {
    continue
    }

    $name, $value = $line.Split("=")
    $value = $value -replace '^\"|\"$'
    [Environment]::SetEnvironmentVariable($name, $value)
}

# take the parameter from command line if provided
if ($URL) {
  $appUri = $URL
} else {
  # Check AZD env variables and figure out the cosmos account name and resource group
  if (-not $env:APP_URL) {
      Write-Host "APP_URL not found in AZD environment (.azure/). Please run `azd env set` first."
      Write-Host "Alternatively, provide app URL using -URL https://<appname>.azurewebsites.net"
      exit 1
  }
  $appUri = $env:APP_URL
}

$appName = $appUri.Split("https://")[1].Split(".azurewebsites.net")[0]
$resGrp = "rg-" + $appName.Split("-")[0]
$cosmosAccName = $appName -replace "webapp", "cosmos"

# Get currently-logged in user
$userId = az ad signed-in-user show --query id --output tsv


Write-Host "`nApp Name: $appName"
Write-Host "Resource Group: $resGrp"
Write-Host "CosmosDB Account: $cosmosAccName"
Write-Host "`nReady to add 'Cosmos DB Built-in Data Contributor' role for local user Principal ID: $userId"

$response = Read-Host -Prompt "`nDoes this look ok? Enter 'y' to continue, anything else to exit."
if ($response -ne "y") {
    exit
}

az cosmosdb sql role assignment create --account-name $cosmosAccName `
                                       --resource-group $resGrp `
                                       --scope "/" `
                                       --principal-id $userId `
                                       --role-definition-id 00000000-0000-0000-0000-000000000002

Write-Host "All done!"