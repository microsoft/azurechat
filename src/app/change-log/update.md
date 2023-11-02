# Azure Chat Updates

Below are the updates for the Azure Chat Solution accelerator

## 📂 Chat with file

- In the chat with file feature, you can now see citations within the responses. Simply click on the citation to access the related context.

- You can now upload files to existing chats, allowing you to chat with multiple files simultaneously.

## 🎙️ Speech

Ability to use Azure Speech in conversations. This feature is not enabled by default. To enable this feature, you must set the environment variable `NEXT_PUBLIC_SPEECH_ENABLED=true` along with the Azure Speech subscription key and region.

```
NEXT_PUBLIC_SPEECH_ENABLED=true
AZURE_SPEECH_REGION="REGION"
AZURE_SPEECH_KEY="1234...."
```

## 🔑 Environment variable change

Please note that the solution has been upgraded to utilise the most recent version of the OpenAI JavaScript SDK, necessitating the use of the `OPENAI_API_KEY` environment variable.

Ensure that you update the variable name in both your '.env' file and the configuration within Azure App Service or Key Vault, changing it from `AZURE_OPENAI_API_KEY` to `OPENAI_API_KEY`.
