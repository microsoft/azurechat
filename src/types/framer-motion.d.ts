declare module 'framer-motion' {
  import * as React from 'react';

  export interface AnimatePresenceProps {
    children?: React.ReactNode;
    exitBeforeEnter?: boolean;
    initial?: boolean;
    onExitComplete?: () => void;
    mode?: string;
  }

  export interface MotionProps {
    initial?: any;
    animate?: any;
    exit?: any;
    variants?: any;
    transition?: any;
    whileHover?: any;
    whileTap?: any;
    className?: string;
    style?: React.CSSProperties;
    children?: React.ReactNode;
    onHoverStart?: () => void;
    onHoverEnd?: () => void;
  }

  export interface MotionDivProps extends React.HTMLAttributes<HTMLDivElement>, MotionProps {}

  export const motion: {
    div: React.ForwardRefExoticComponent<MotionDivProps>;
    // Add other HTML elements as needed
  };

  export const AnimatePresence: React.FC<AnimatePresenceProps>;
}
