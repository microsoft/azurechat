import createClient, { ErrorResponseOutput, TranslatedTextItemOutput } from "@azure-rest/ai-translation-text";

export function getBooleanEnv(variable: string): boolean {
    return process.env[variable]?.toLowerCase() === 'true';
}

export async function translator(input: string) {

    if (getBooleanEnv('TRANSLATOR_ENABLED')) {
        if (typeof input === 'string') {
            const normalizedInput = input.toLowerCase();
            const translatedText = await translateFunction([{ text: normalizedInput }], "en-GB", "en-US");
            const revertedText = revertCase(input, translatedText[0]);
            return revertedText;
        } else {
            console.error("Invalid input type:", input);
            return input ?? null;
        }
    }
    else {
        return input ?? null;
    }
}

async function translateFunction(inputText: { text: string }[], translatedTo: string, translatedFrom: string) {

    const apiKey = process.env.AZURE_TRANSLATOR_KEY;
    const endpoint = process.env.AZURE_TRANSLATOR_URL;
    const region = process.env.AZURE_SPEECH_REGION;

    const translateCredential = {
        key: apiKey,
        region,
    };
    const translationClient = createClient(endpoint, translateCredential);

    const translateResponse = await translationClient.path("/translate").post({
        body: inputText,
        queryParameters: {
            to: translatedTo,
            from: translatedFrom,
        },
        headers: {
            "api-key": apiKey,
        }
    });

    const translations = translateResponse.body as TranslatedTextItemOutput[] | ErrorResponseOutput;

    if (Array.isArray(translations)) {
        const translatedStrings = translations.map(translation => translation.translations[0].text);
        return translatedStrings;
    } else {
        console.error("Translation error:", translations);
        return [];
    }
}

function revertCase(originalText: string, translatedText: string): string {
    return originalText
        .split('')
        .map((originalChar, index) =>
            originalChar === originalChar.toUpperCase()
                ? translatedText[index].toUpperCase()
                : translatedText[index]
        )
        .join('');
}
