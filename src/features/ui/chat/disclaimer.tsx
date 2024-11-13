// Disclaimer Component in TypeScript
import React from 'react';

interface DisclaimerProps {
  text: string;
}

const Disclaimer: React.FC<DisclaimerProps> = ({ text }) => {
  return (
    <div className="w-full py-4">
        <div className="container max-w-3xl flex justify-between items-center">
        <p>{text}</p>
        </div>
    </div>
  );
};

export default Disclaimer;

