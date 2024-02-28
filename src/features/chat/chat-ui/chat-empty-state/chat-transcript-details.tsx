import React, { useState } from 'react';
import * as Label from '@radix-ui/react-label';
import { AssociateOffenderWithChatThread } from '../../chat-services/chat-thread-service';
import { Button } from '@/components/ui/button';

interface OffenderTranscriptFormProps {
    chatThreadId: string;
}

export const OffenderTranscriptForm = ({ chatThreadId }: OffenderTranscriptFormProps) => {
  const [offenderId, setOffenderId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [isIdSaved, setIsIdSaved] = useState(false); // New state to track if ID is saved
  const [message, setMessage] = useState('');

  const handleSubmit = async (event: { preventDefault: () => void; }) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage('');

    try {
        await AssociateOffenderWithChatThread(chatThreadId, offenderId);
        setMessage(`Offender ID ${offenderId} saved.`);
        setIsIdSaved(true); // Set isIdSaved to true upon successful save
      } catch (error) {
        console.log(error);
        setMessage('Failed to save offender ID.');
        setIsIdSaved(false); // Ensure isIdSaved is false if saving fails
      } finally {
        setSubmitting(false);
      }
    };

  return (
    <div className="bg-background p-5">
      {isIdSaved ? (
        // Display the saved offender ID if it's saved
        <div className="text-sm text-muted-foreground">
          Offender ID {offenderId} saved.
        </div>
      ) : (
        // Render the form to input and submit an offender ID if not saved
        <form onSubmit={handleSubmit}>
          <div className="flex flex-wrap items-center grid-cols-3 gap-[15px]">
            <Label.Root htmlFor="offenderID" className="leading-[35px] text-sm text-muted-foreground">
              Offender's Identification Number:
            </Label.Root>
            <input
              className="bg-inputBackground text-sm text-muted-foreground shadow-blackA6 inline-flex h-[35px] w-[200px] appearance-none items-center justify-center rounded-[4px] px-[10px] leading-none shadow-[0_0_0_1px] outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary selection:text-foreground selection:bg-accent"
              type="text"
              id="offenderID"
              name="offenderID"
              placeholder="Offender ID #A123456"
              pattern="^[A-Za-z][0-9]{6}$"
              title="ID must start with a letter followed by six digits (e.g., A123456)"
              required
              autoComplete="off"
              value={offenderId}
              onChange={(e) => setOffenderId(e.target.value)}
            />
            <Button variant="default" type="submit" disabled={submitting} >
              {submitting ? 'Submitting...' : 'Submit'}
            </Button>
          </div>
          {message && <div aria-live="polite" className="text-sm text-muted-foreground">{message}</div>}
        </form>
      )}
    </div>
  );
};
