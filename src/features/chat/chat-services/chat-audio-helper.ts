"use server";
import "server-only";
import { AudioConfig, SpeechRecognitionResult, CancellationDetails, CancellationReason, ResultReason, SpeechConfig, SpeechRecognizer, AudioInputStream } from "microsoft-cognitiveservices-speech-sdk";
import { arrayBufferToBase64 } from "./chat-document-helper";
import { GetSpeechToken } from "../chat-ui/chat-speech/speech-service";
import { AudioOutputFormatImpl } from "microsoft-cognitiveservices-speech-sdk/distrib/lib/src/sdk/Audio/AudioOutputFormat";
import { FileAudioSource } from "microsoft-cognitiveservices-speech-sdk/distrib/lib/src/common.browser/FileAudioSource";

export const speechToTextRecognizeOnce = async (formData: FormData) => {
    try {
        const speechToken = await GetSpeechToken();
        const apimUrl = new URL(speechToken.sttUrl);

        // Speech Configurations
        const speechConfig = SpeechConfig.fromEndpoint(
            apimUrl
        );
        speechConfig.speechRecognitionLanguage = "en-GB";
        speechConfig.authorizationToken = speechToken.token;

        /**Convert File to Buffer**/
        const file: File | null = formData.get('audio') as unknown as File;

        // Audio Configurations
        const audioConfig = await audioConfigFromFile(file);

        // Speech recognizer config
        const recognizer = new SpeechRecognizer(speechConfig, audioConfig);

        // Final result
        const text = await startRecognition(recognizer);

        return text;
    } catch (e) {
        throw (e);
    }
}

/**
 * Starts speech recognition, and stops after the first utterance is recognized. The task returns the recognition text as result. Note: RecognizeOnceAsync() returns when the first utterance has been recognized, so it is suitable only for single shot recognition like command or query.
 */
async function recognizeOnceFromFile(recognizer: SpeechRecognizer): Promise<string> {
    try {
        let recognisedText = "";

        // Call recognizeOnceAsync and wait for its completion
        const result = await new Promise<SpeechRecognitionResult>((resolve, reject) => {
            recognizer.recognizeOnceAsync(
                (res: SpeechRecognitionResult) => resolve(res),
                (err: any) => reject(err)
            );
        });

        if (result) {
            switch (result.reason) {
                case ResultReason.RecognizedSpeech:
                    // console.log(`RECOGNIZED: Text=${result.text}`);
                    recognisedText = result.text;
                    break;
                case ResultReason.NoMatch:
                    console.log("NOMATCH: Speech could not be recognized.");
                    break;
                case ResultReason.Canceled:
                    const cancellation = CancellationDetails.fromResult(result);
                    console.log(`CANCELED: Reason=${cancellation.reason}`);

                    if (cancellation.reason === CancellationReason.Error) {
                        console.log(`CANCELED: ErrorCode=${cancellation.ErrorCode}`);
                        console.log(`CANCELED: ErrorDetails=${cancellation.errorDetails}`);
                        console.log("CANCELED: Did you set the speech resource key and region values?");
                    }
                    break;
            }
        } else {
            console.log("Recognition result is null or undefined.");
        }

        // Close the recognizer
        recognizer.close();

        return recognisedText;
    } catch (e) {
        console.log(e);
        return "";
    }
}

/**
 * The event recognised signals that a final recognition result is received.
 */
async function startRecognition(recognizer: SpeechRecognizer): Promise<string[]> {
    try {
        let texts: string[] = [];
        const result = await new Promise<string[]>((resolve, reject) => {
            recognizer.recognized = (s, e) => {
                if (e.result.reason == 3) {
                    // console.log(e.result.text);
                    texts.push(e.result.text)
                }
            };

            recognizer.canceled = (s, e) => {
                resolve(texts);
            };

            recognizer.startContinuousRecognitionAsync();
        });
        return texts;
    } catch (e) {
        console.log(e);
        return [];
    }

}

/**
 * Initialise audio configurations from file
 */
const audioConfigFromFile = async (file: File): Promise<AudioConfig> => {
    try {
        // Create Buffer
        const base64String = await arrayBufferToBase64(await file.arrayBuffer());
        const buffer = Buffer.from(base64String, "base64");

        // Audio Configurations
        const audioConfig = AudioConfig.fromWavFileInput(buffer, file.name);

        //File Audio Source - Throw error if wav is corrupted or not readable
        const audioSource = new FileAudioSource(buffer, file.name);
        (await audioSource.format).formatTag;

        return audioConfig;
    }
    catch (e) {
        throw new Error('Unsupported audio file. ' + e);
    }
}

/**
 * Initialise audio configurations from Stream
 */
const audioConfigFromStream = async (file: File) => {
    try {

        // Get Default Format
        const audioFormat = AudioOutputFormatImpl.getDefaultInputFormat();

        // Create Stream
        const arrayBuffer = await file.arrayBuffer();
        const pushStream = AudioInputStream.createPushStream(audioFormat);
        pushStream.write(arrayBuffer);

        // Init Audio Config
        const audioConfig = AudioConfig.fromStreamInput(pushStream);

        return audioConfig;
    } catch (e) {
        throw new Error('Unsupported audio file. ' + e);
    }
}