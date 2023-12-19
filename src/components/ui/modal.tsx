import { ReactElement } from "react";
import { FC, useState } from "react";
import { CheckIcon, ClipboardIcon, UserCircle, ThumbsUp, ThumbsDown } from "lucide-react";

interface ModalProps {
    chatThreadId: string;
    open: boolean;
    onClose: () => void;
    onSubmit: (chatMessageId: string, feedback: string, reason: string) => void;
    onFeedbackReceived: (feedback: string) => void;
    onReasonReceived: (reason: string) => void;
}

export default function Modal(props: ModalProps): ReturnType<FC> {
    const [feedback, setFeedback] = useState(''); 
    const [reason, setReason] = useState(""); 
    const [chatMessageId, setChatMessageId] = useState<string>(""); 
    const [isClicked, setIsClicked] = useState(false);


  const handleBlur = () => {
      setIsClicked(false);
  };

  const buttonStyles = {
      fontWeight: 'bold',
      padding: '8px 12px',
      backgroundColor: isClicked ? '#e0e0e0' : 'transparent',
  };


    const handleFeedbackChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      setFeedback(event.target.value);
    };


    const handleSubmit = () => {
      setChatMessageId(chatMessageId);
      props.onFeedbackReceived(feedback);
      props.onFeedbackReceived(reason);
      props.onSubmit(chatMessageId,feedback, reason); 
      props.onClose(); 
    };


    const handleReasonSelection = (reason: string) => {
      setIsClicked(true);
      setReason(reason);
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
              className={feedback === 'unsatisfied' ? 'selected-btn' : 'btn'}
              onClick={() => handleReasonSelection('unsatisfied')}
              onBlur={handleBlur}
              style={buttonStyles}
            >
              Unsatisfied
            </button>

            <span className="button-space" />
            
            <button
              type="button"
              className={feedback === 'unsafe' ? 'selected-btn' : 'btn'}
              onClick={() => handleReasonSelection('unsafe')}
              onBlur={handleBlur}
              style={buttonStyles}
            >
              Unsafe
            </button>
            
            <span className="button-space" />

            <button
              type="button"
              className={feedback === 'inaccurate' ? 'selected-btn' : 'btn'}
              onClick={() => handleReasonSelection('inaccurate')}
              onBlur={handleBlur}
              style={buttonStyles}
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