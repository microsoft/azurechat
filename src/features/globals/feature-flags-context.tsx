"use client";

import {
  DEFAULT_FEATURE_FLAGS,
  FeatureFlags,
} from "@/features/common/feature-flags-model";
import { createContext, useContext } from "react";

const FeatureFlagsContext = createContext<FeatureFlags>(DEFAULT_FEATURE_FLAGS);

export const FeatureFlagsProvider = (props: {
  flags: FeatureFlags;
  children: React.ReactNode;
}) => {
  return (
    <FeatureFlagsContext.Provider value={props.flags}>
      {props.children}
    </FeatureFlagsContext.Provider>
  );
};

export const useFeatureFlags = () => useContext(FeatureFlagsContext);
