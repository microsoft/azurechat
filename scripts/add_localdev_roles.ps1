###
# This script adds a the required Cosmos DB Data Contributor role to the local user, 
# so you can do local dev connecting to the deployed Azure resources.
# This will only work if you have used AZD to deploy the app, and have the required permissions to modify IAM.

Write-Host "`nThis script will add the required IAM roles to allow the logged in user to run AzureChat locally."
Write-Host "This will only work if you have used AZD to deploy the app, and have the required permissions to modify IAM."

Write-Host "`nLoading azd .env file from current environment..."
$output = azd env get-values
foreach ($line in $output) {
    if (!$line.Contains('=')) {
    continue
    }

    $name, $value = $line.Split("=")
    $value = $value -replace '^\"|\"$'
    [Environment]::SetEnvironmentVariable($name, $value)
}

$sub = $env:AZURE_SUBSCRIPTION_ID
$rg = $env:AZURE_RESOURCE_GROUP
$appName = $env:AZURE_WEBAPP_NAME
$cosmosAccName = $env:AZURE_COSMOSDB_ACCOUNT_NAME
$aillmName = $env:AZURE_OPENAI_API_INSTANCE_NAME
$searchName = $env:AZURE_SEARCH_NAME
$storageName = $env:AZURE_STORAGE_ACCOUNT_NAME
$dalleName = $env:AZURE_OPENAI_DALLE_API_INSTANCE_NAME
$docIntelName = $env:AZURE_DOCUMENT_INTELLIGENCE_NAME

Write-Host "Resource Group:         $rg"
Write-Host "App Host Name:          $appName"
Write-Host "CosmosDB Account:       $cosmosAccName"
Write-Host "OpenAI LLM Instance:    $aillmName"
Write-Host "OpenAI DALL-E Instance: $dalleName"
Write-Host "Storage Account:        $storageName"
Write-Host "Document Intelligence:  $docIntelName"
Write-Host "Search Service:         $searchName"

# Get currently-logged in user
$userInfo = az ad signed-in-user show --query '{id: id, userPrincipalName: userPrincipalName}' | ConvertFrom-Json
$userId = $userInfo.id
$userPrincipalName = $userInfo.userPrincipalName

Write-Host "`nLogged-in user:         $userPrincipalName (ID: $userId)"

$response = Read-Host -Prompt "`nDoes this look ok? `nEnter 'y' to continue, anything else to exit."
if ($response -ne "y") {
    exit
}

Write-Host "`nAdding 'Cosmos DB Built-in Data Contributor' role on $cosmosAccName"
az cosmosdb sql role assignment create --account-name $cosmosAccName `
                                       --resource-group $rg `
                                       --scope "/" `
                                       --principal-id $userId `
                                       --role-definition-id 00000000-0000-0000-0000-000000000002

$aillmNameScope = "/subscriptions/$sub/resourceGroups/$rg/providers/Microsoft.CognitiveServices/accounts/$aillmName"
$dalleScope = "/subscriptions/$sub/resourceGroups/$rg/providers/Microsoft.CognitiveServices/accounts/$dalleName"
$storageScope = "/subscriptions/$sub/resourceGroups/$rg/providers/Microsoft.Storage/storageAccounts/$storageName"
$searchScope = "/subscriptions/$sub/resourceGroups/$rg/providers/Microsoft.Search/searchServices/$searchName"
$docIntelScope = "/subscriptions/$sub/resourceGroups/$rg/providers/Microsoft.CognitiveServices/accounts/$docIntelName"

Write-Host "`nAdding 'Cognitive Services OpenAI User' role on $aillmName"
az role assignment create --assignee $userId --role "Cognitive Services OpenAI User" --scope $aillmNameScope

Write-Host "`nAdding 'Cognitive Services OpenAI User' role on $dalleName"
az role assignment create --assignee $userId --role "Cognitive Services OpenAI User" --scope $dalleScope

Write-Host "`nAdding 'Storage Blob Data Contributor' role on $storageName"
az role assignment create --assignee $userId --role "Storage Blob Data Contributor" --scope $storageScope

Write-Host "`nAdding 'Cognitive Services User' role on $docIntelName"
az role assignment create --assignee $userId --role "Cognitive Services User" --scope $docIntelScope

Write-Host "`nAdding 'Search Service Contributor' role on $searchName"
az role assignment create --assignee $userId --role "Search Service Contributor" --scope $searchScope

Write-Host "`nAdding 'Search Index Data Contributor' role on $searchName"
az role assignment create --assignee $userId --role "Search Index Data Contributor" --scope $searchScope

Write-Host "All done!"