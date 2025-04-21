// Disclaimer Component in TypeScript
import React, { ReactNode } from 'react';


interface DisclaimerProps {
  text: ReactNode;
}

const Disclaimer: React.FC<DisclaimerProps> = ({ text }) => {
  return (
    <div className="w-full pt-0 pb-2">
        <div className="container max-w-3xl flex justify-between items-center">
        <p>{text}</p>
        </div>
    </div>
  );
};

export default Disclaimer;
