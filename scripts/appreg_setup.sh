#!/bin/bash

# Parse parameters
showsecret_flag="false"
webappname=""

while [[ "$#" -gt 0 ]]; do
    case $1 in
        -w|--webappname)
            webappname="$2"
            shift
            ;;
        -showsecret)
            showsecret_flag="true"
            ;;
        -localredirect)
            local_redirect_flag="true"
            ;;
        *)
            echo "Unknown parameter passed: $1"
            exit 1
            ;;
    esac
    shift
done

if [[ -z "$webappname" ]]; then
    webappname=$(azd env get-value AZURE_WEBAPP_NAME)
fi

if [[ -z "$webappname" ]] || [[ $webappname == *"ERROR"* ]]; then

    echo ""
    echo "Usage: $0 -w <webappname> [-showsecret] [-localredirect]"
    echo "No arguments provided. Please provide the web app name from the Azure portal (e.g. azurechat-ulg3yy5ybjhdq)."
    exit 1
fi

tenantid=$(az account show --query tenantId --output tsv | tr -d '[:space:]')

echo "About to create a new App Registration called ${webappname}-app in Microsoft Entra tenant $tenantid"
echo "NOTE: This will only work if you have the necessary permissions in the tenant."

read -p "Do you wish to proceed (y/n)? " choice
if [[ "$choice" != "y" && "$choice" != "Y" ]]; then
    echo "Exiting."
    exit 1
fi

clientid=$(az ad app create --display-name "${webappname}-app" --sign-in-audience AzureADMyOrg --query appId --output tsv | tr -d '[:space:]')
echo "> Creating app registration with client id $clientid ..."

objectid=$(az ad app show --id $clientid --query id --output tsv | tr -d '[:space:]')
echo "Done. Object id is $objectid"

echo "> Creating client secret... (you can ignore credential warnings)"
clientsecret=$(az ad app credential reset --id $clientid --append --display-name mysecret --years 1 --query password --output tsv | tr -d '[:space:]')
echo "Done."

redirecturl="https://${webappname}.azurewebsites.net/api/auth/callback/azure-ad"
graphurl="https://graph.microsoft.com/v1.0/applications/${objectid}"

if [[ "$local_redirect_flag" == "true" ]]; then
    echo "> Updating redirect url to $redirecturl and http://localhost:3000/api/auth/callback/azure-ad..."
    redirectBody="{'web':{'redirectUris':['${redirecturl}','http://localhost:3000/api/auth/callback/azure-ad']}}"
else
    echo "> Updating redirect url to $redirecturl..."
    redirectBody="{'web':{'redirectUris':['${redirecturl}']}}"
fi

az rest --method PATCH --uri $graphurl --body $redirectBody
echo "Done."

rg=$(az webapp list --query "[?name=='${webappname}'].resourceGroup" --output tsv | tr -d '[:space:]')
echo "> Found the app resource group: $rg"

echo "> Updating app settings with client id, tenant id, and client secret..."
az webapp config appsettings set -n "$webappname" -g "$rg" --settings "AZURE_AD_CLIENT_ID=$clientid" "AZURE_AD_TENANT_ID=$tenantid" "AZURE_AD_CLIENT_SECRET=$clientsecret" --output none
echo "Done."

echo "AZURE_AD_CLIENT_ID=$clientid"
echo "AZURE_AD_TENANT_ID=$tenantid"
if [[ "$showsecret_flag" == "true" ]]; then
    echo "AZURE_AD_CLIENT_SECRET=$clientsecret"
    echo "^^ Ensure you clear your console history to remove this secret"
fi

echo "> Setup complete."