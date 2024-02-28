"use server";
import { ApplicationInsights } from "@microsoft/applicationinsights-web";
import "server-only";

export async function arrayBufferToBase64(buffer: ArrayBuffer) {
    const binary = new Uint8Array(buffer);
    let base64String = '';
    for (let i = 0; i < binary.length; i++) {
        base64String += String.fromCharCode(binary[i]);
    }
    return btoa(base64String);
};

const customDocumentIntelligenceObject = (modelId?: string, resultId?: string) => {
    const apiVersion = "2023-07-31";
    const analyzeDocumentUrl = process.env.AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT + "/formrecognizer/documentModels/" + modelId + ":analyze?api-version=" + apiVersion + "&locale=en-GB";
    const analyzeResultUrl = process.env.AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT + "/formrecognizer/documentModels/" + modelId + "/analyzeResults/" + resultId + "?api-version=" + apiVersion;
    const diHeaders = {
        'Content-Type': 'application/json',
        'api-key': process.env.AZURE_DOCUMENT_INTELLIGENCE_KEY
    };
    return {
        analyzeDocumentUrl,
        analyzeResultUrl,
        diHeaders
    };
};

export async function customBeginAnalyzeDocument(modelId: string, source: string, sourceType: 'base64' | 'url') {
    const diParam = customDocumentIntelligenceObject(modelId);
    const analyzeDocumentUrl = diParam.analyzeDocumentUrl;
    const analyzeDocumentHeaders = diParam.diHeaders;
    const analyzeDocumentBody = sourceType === 'base64' ? { 'base64Source': source } : { 'urlSource': source };

    try {
        const response = await fetch(analyzeDocumentUrl, {
            method: 'POST',
            headers: analyzeDocumentHeaders,
            body: JSON.stringify(analyzeDocumentBody),
        });

        if (!response.ok) {
            throw new Error('Failed to analyze document. ' + response.statusText);
        }

        const resultId = response.headers.get('apim-request-id');

        if (resultId != null) {
            return await customGetAnalyzeResult(modelId, resultId);
        }

        throw new Error('Failed to get Result ID. Status: ' + response.status);
    } catch (e) {
        console.log('Error at BeginAnalyzeDocument:', e);
        throw e;
    }
};

async function customGetAnalyzeResult(modelId: string, resultId: string) {

    const diParam = customDocumentIntelligenceObject(modelId, resultId);
    const analyzeResultUrl = diParam.analyzeResultUrl;
    const analyzeDocumentHeaders = diParam.diHeaders;

    try{

        let operationStatus;
        let analyzedResult;

        while(!operationStatus || operationStatus !== "succeeded"){

            const response = await fetch(analyzeResultUrl, {
                method: 'GET',
                headers: analyzeDocumentHeaders
            });

            if (!response.ok) {
                throw new Error('Failed to fetch result.'+ response.json);
            }

            const responseBody = await response.json();
            
            operationStatus = responseBody.status;

            if(operationStatus === "succeeded"){
                analyzedResult = responseBody.analyzeResult;
                break;
            }

            await new Promise(resolve => setTimeout(resolve, 5000));
        }

        return analyzedResult;        
    }
    catch(e){
        console.log('Error at AnalyzeResult', e);
    }
};


// const customDocumentIntelligenceObject = (modelId?: string, resultId?: string) => {
//     const apiVersion = "2023-07-31"
//     const analyzeDocumentUrl = process.env.AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT + "/formrecognizer/documentModels/" + modelId + ":analyze?api-version=" + apiVersion + "&locale=en-GB";
//     const analyzeResultUrl = process.env.AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT + "/formrecognizer/documentModels/" + modelId + "/analyzeResults/" + resultId + "?api-version=" + apiVersion + ""
//     const diHeaders = {
//         'Content-Type': 'application/json',
//         'api-key': process.env.AZURE_DOCUMENT_INTELLIGENCE_KEY
//     }
//     return {
//         analyzeDocumentUrl,
//         analyzeResultUrl,
//         diHeaders
//     }
// }

// export async function customBeginAnalyzeDocument(modelId: string, base64String: string) {
    
//     const diParam = customDocumentIntelligenceObject(modelId);
//     const analyzeDocumentUrl = diParam.analyzeDocumentUrl;
//     const analyzeDocumentHeaders = diParam.diHeaders;
//     const analyzeDocumentBody = {
//         'base64Source': base64String
//     }

//     try {
//         const response = await fetch(analyzeDocumentUrl, {
//             method: 'POST',
//             headers: analyzeDocumentHeaders,
//             body: JSON.stringify(analyzeDocumentBody),
//         });

//         if (!response.ok) {
//             throw new Error('Failed to analyze document. '+ response.statusText);
//         }

//         const resultId = response.headers.get('apim-request-id');

//         if(resultId != null)
//         {
//             return await customGetAnalyzeResult(modelId, resultId);
//         }

//         throw new Error('Failed to get Result ID. Status: ' + response.status)
//     }
//     catch (e) {
//         console.log('Error at BeginAnalyzeDocument:', e);
//     }
// }