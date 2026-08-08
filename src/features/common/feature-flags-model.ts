export interface FeatureFlags {
  speechEnabled: boolean;
  chatWithFileEnabled: boolean;
  imageGenEnabled: boolean;
  extensionsEnabled: boolean;
  multimodalEnabled: boolean;
}

export const DEFAULT_FEATURE_FLAGS: FeatureFlags = {
  speechEnabled: false,
  chatWithFileEnabled: false,
  imageGenEnabled: false,
  extensionsEnabled: false,
  multimodalEnabled: true,
};
