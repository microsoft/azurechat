#!/bin/bash

echo -e "\nThis script will add the required IAM roles to allow the logged in user to run AzureChat locally."
echo "This will only work if you have used AZD to deploy the app, and have the required permissions to modify IAM."

echo -e "\nLoading azd .env file from current environment..."
# Read the environment variables from azd and export them
while IFS= read -r line; do
    # Only process lines with an equal sign
    if [[ "$line" != *"="* ]]; then
        continue
    fi

    key="${line%%=*}"
    value="${line#*=}"
    # Remove leading and trailing quotes if they exist
    value="${value%\"}"
    value="${value#\"}"
    export "$key"="$value"
done < <(azd env get-values)

# Retrieve required environment variables
sub="${AZURE_SUBSCRIPTION_ID}"
rg="${AZURE_RESOURCE_GROUP}"
appName="${AZURE_WEBAPP_NAME}"
cosmosAccName="${AZURE_COSMOSDB_ACCOUNT_NAME}"
aillmName="${AZURE_OPENAI_API_INSTANCE_NAME}"
searchName="${AZURE_SEARCH_NAME}"
storageName="${AZURE_STORAGE_ACCOUNT_NAME}"
dalleName="${AZURE_OPENAI_DALLE_API_INSTANCE_NAME}"
docIntelName="${AZURE_DOCUMENT_INTELLIGENCE_NAME}"

echo "Resource Group:         $rg"
echo "App Host Name:          $appName"
echo "CosmosDB Account:       $cosmosAccName"
echo "OpenAI LLM Instance:    $aillmName"
echo "OpenAI DALL-E Instance: $dalleName"
echo "Storage Account:        $storageName"
echo "Document Intelligence:  $docIntelName"
echo "Search Service:         $searchName"

# Get currently logged in user details using az and jq
userId=$(az ad signed-in-user show --query "id" -o tsv)
userPrincipalName=$(az ad signed-in-user show --query "userPrincipalName" -o tsv)

echo -e "\nLogged-in user:         $userPrincipalName (ID: $userId)"

read -p $'\nDoes this look ok? \nEnter "y" to continue, anything else to exit: ' response
if [[ "$response" != "y" ]]; then
    exit
fi

echo -e "\nAdding 'Cosmos DB Built-in Data Contributor' role on $cosmosAccName"
az cosmosdb sql role assignment create --account-name "$cosmosAccName" \
                                        --resource-group "$rg" \
                                        --scope "/" \
                                        --principal-id "$userId" \
                                        --role-definition-id "00000000-0000-0000-0000-000000000002"

aillmNameScope="/subscriptions/$sub/resourceGroups/$rg/providers/Microsoft.CognitiveServices/accounts/$aillmName"
dalleScope="/subscriptions/$sub/resourceGroups/$rg/providers/Microsoft.CognitiveServices/accounts/$dalleName"
storageScope="/subscriptions/$sub/resourceGroups/$rg/providers/Microsoft.Storage/storageAccounts/$storageName"
searchScope="/subscriptions/$sub/resourceGroups/$rg/providers/Microsoft.Search/searchServices/$searchName"
docIntelScope="/subscriptions/$sub/resourceGroups/$rg/providers/Microsoft.CognitiveServices/accounts/$docIntelName"

echo -e "\nAdding 'Cognitive Services OpenAI User' role on $aillmName"
az role assignment create --assignee "$userId" --role "Cognitive Services OpenAI User" --scope "$aillmNameScope"

echo -e "\nAdding 'Cognitive Services OpenAI User' role on $dalleName"
az role assignment create --assignee "$userId" --role "Cognitive Services OpenAI User" --scope "$dalleScope"

echo -e "\nAdding 'Storage Blob Data Contributor' role on $storageName"
az role assignment create --assignee "$userId" --role "Storage Blob Data Contributor" --scope "$storageScope"

echo -e "\nAdding 'Cognitive Services User' role on $docIntelName"
az role assignment create --assignee "$userId" --role "Cognitive Services User" --scope "$docIntelScope"

echo -e "\nAdding 'Search Service Contributor' role on $searchName"
az role assignment create --assignee "$userId" --role "Search Service Contributor" --scope "$searchScope"

echo -e "\nAdding 'Search Index Data Contributor' role on $searchName"
az role assignment create --assignee "$userId" --role "Search Index Data Contributor" --scope "$searchScope"

echo "All done!"