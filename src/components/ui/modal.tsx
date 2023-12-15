import { ReactElement } from "react";
import { FC } from "react";
import { CheckIcon, ClipboardIcon, UserCircle, ThumbsUp, ThumbsDown } from "lucide-react";

interface ModalProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (feedback: string, reason: string | null) => void;
    children: ReactElement;
}

export default function Modal(props: ModalProps): ReturnType<FC> {
    let feedbackText = ''; // State to hold the feedback text
    let selectedReason: string | null = null; // State to hold the selected reason

    const handleFeedbackChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      feedbackText = event.target.value; // Update feedback text as it changes
    };


    const handleSubmit = () => {
        props.onSubmit(feedbackText, selectedReason); // Pass the feedback text and reason to the parent component
        props.onClose(); // Close the modal
    };


    const handleReasonSelection = (reason: string) => {
        props.onSubmit(feedbackText, selectedReason); // Pass the feedback text and reason to the parent component
        props.onClose(); // Close the modal
      };

    return (
        <div className={`${"modal"} ${props.open ? "display-block" : "display-none"}`}>
            <div className="modal-main">
                <div className="modal-head">
                    <h1>Submit your feedback</h1>
                </div>

                <div className="modal-body">
                <textarea
                    placeholder="Enter your feedback here"
                    rows={4}
                    cols={50}
                    onChange={handleFeedbackChange}
                />
                </div>

                <div className="reason-buttons">
            <button
              type="button"
              className={selectedReason === 'unsatisfied' ? 'selected-btn' : 'btn'}
              onClick={() => handleReasonSelection('unsatisfied')}
            >
              Unsatisfied
            </button>

            <span className="button-space" />
            
            <button
              type="button"
              className={selectedReason === 'unsafe' ? 'selected-btn' : 'btn'}
              onClick={() => handleReasonSelection('unsafe')}
            >
              Unsafe
            </button>
            
            <span className="button-space" />

            <button
              type="button"
              className={selectedReason === 'inaccurate' ? 'selected-btn' : 'btn'}
              onClick={() => handleReasonSelection('inaccurate')}
            >
              Inaccurate
            </button>
          </div>

                <div className="btn-container">
                    <button type="button" className="btn" onClick={handleSubmit}>Submit</button>
                    <button type="button" className="btn" onClick={props.onClose}>Close</button>
                </div>
            </div>
        </div>
    );
}