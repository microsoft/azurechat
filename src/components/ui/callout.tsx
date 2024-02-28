import React from 'react';
import Typography from '../typography';

interface Props {
  title: string;
  description: string;
}

export const Callout = ({ title, description }: Props) => {
  return (
    <div className="bg-/100 p-6 border-l-4 border-accent max-w-lg">
      <Typography variant="h3" className="text-lg font-semibold mb-2">
        {title}
      </Typography>
      <Typography variant="p" className="text-base">
        {description}
      </Typography>
    </div>
  );
};

export default Callout;