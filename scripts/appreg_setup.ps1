# This script creates an App Registration in Entra ID for the AzureChat app and 
# configures the required environment variables in the Web App.

param (
    [string]$webappname
)

if (-not $webappname) {
    Write-Host "`n  Usage: .\appreg_setup.ps1 -webappname <webappname> [-showsecret] `n"
    Write-Host "No arguments provided. Please provide the web app name from the Azure portal (e.g. azurechat-ulg3yy5ybjhdq)."
    Write-Host "The -showsecret flag will display the client secret in the console output."
    exit 1
}

$tenantid = (az account show --query tenantId --output tsv).Trim()

Write-Host "About to create a new App Registration called $webappname-app in Microsoft Entra tenant $tenantid"
Write-Host "NOTE: This will only work if you have the necessary permissions in the tenant."

$choice = Read-Host "Do you wish to proceed (y/n)?"
if ($choice -ne 'y' -and $choice -ne 'Y') {
    Write-Host "exiting"
    exit 1
}

$clientid = (az ad app create --display-name "$webappname-app" --sign-in-audience AzureADMyOrg --query appId --output tsv).Trim()
Write-Host "> Creating app registration with client id $clientid ..."
$objectid = (az ad app show --id $clientid --query id --output tsv).Trim()
Write-Host "Done. Object id is $objectid `n"

Write-Host "> Creating client secret... (you can ignore credential warnings)"
$clientsecret = (az ad app credential reset --id $clientid --append --display-name mysecret --years 1 --query password --output tsv).Trim()
Write-Host "Done. `n"

$redirecttype = "web"
$redirecturl = "https://$webappname.azurewebsites.net/api/auth/callback/azure-ad"
$graphurl = "https://graph.microsoft.com/v1.0/applications/$objectid"
Write-Host "> Updating redirect url to $redirecturl..."
az rest --method PATCH --uri $graphurl --body "{'$redirecttype':{'redirectUris':['$redirecturl']}}"
Write-Host "Done. `n"

$rg = (az webapp list --query "[?name=='$webappname'].resourceGroup" --output tsv).Trim()
Write-Host "> Found the app resource group: $rg"

Write-Host "> Updating app settings with client id, tenant id, and client secret..."
az webapp config appsettings set -n $webappname -g $rg --settings AZURE_AD_CLIENT_ID=$clientid AZURE_AD_TENANT_ID=$tenantid AZURE_AD_CLIENT_SECRET=$clientsecret --output none
Write-Host "Done. `n"

Write-Host "AZURE_AD_CLIENT_ID=$clientid"
Write-Host "AZURE_AD_TENANT_ID=$tenantid"
if ($args -contains "-showsecret") {
    Write-Host "AZURE_AD_CLIENT_SECRET=$clientsecret"
    Write-Host "^^ Ensure you clear your console history to remove this secret"
}
Write-Host "> Setup complete. `n"