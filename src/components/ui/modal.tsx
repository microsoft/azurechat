import React, { FC, useState, useRef, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { XCircle, Ban, FileQuestion } from "lucide-react";
import Typography from "@/components/typography";


interface ModalProps {
    chatThreadId: string;
    open: boolean;
    onClose: () => void;
    onSubmit: (chatMessageId: string, feedback: string, reason: string) => void;
}

export default function Modal(props: ModalProps): ReturnType<FC> {
    const [feedback, setFeedback] = useState<string>(''); 
    const [reason, setReason] = useState(""); 
    const textAreaRef = useRef<HTMLTextAreaElement>(null); // Reference to the textarea element
    const [areTabsEnabled, setTabsEnabled] = useState<boolean>(false); // State to manage TabsTrigger disabled/enabled

    // useEffect(() => {
    //   if (props.open) {
    //     setFeedback('');
    //   }
    // }, [props.open]);


    async function handleFeedbackChange(): Promise<void> {
      const textareaValue = textAreaRef.current?.value || "";

      if (!areTabsEnabled) {
        setTabsEnabled(true);
      }

      setFeedback(textareaValue);
    };


    const handleReasonChange = (reason: string) => {
      setReason(reason);
    };

    async function handleSubmit(): Promise<void> {
      props.onSubmit(props.chatThreadId,feedback, reason); 
      setFeedback('');
      props.onClose(); 
    };

    return (
        <div className={`${"modal"} ${props.open ? "display-block" : "display-none"}`}>
            <div className="modal-main">
                <div className="modal-head">
                <Typography variant="h4" className="text-primary">
                Submit your feedback
                </Typography>
                </div>

                <div className="col-span-2 gap-5 flex flex-col flex-1">
                <textarea
                    placeholder="Enter your feedback here"
                    ref={textAreaRef}
                    rows={6}
                    cols={50}
                    className="textarea-with-spacing"
                    onChange={(event) =>  handleFeedbackChange()}
                    // defaultValue={"Enter your feedback here..."}
                />
                </div>

                <div className="reason-buttons">

            <Tabs
              defaultValue={""}
              onValueChange={(value) => handleReasonChange(value)}
            >
              <TabsList className="flex w-full justify-center gap-5" >
                <TabsTrigger
                  value="Unsafe"
                  className="flex items-center justify-center flex-2"
                  disabled={!areTabsEnabled}
                >
                  <Ban size={20} /> Unsafe
                </TabsTrigger>
                <TabsTrigger
                  value="Inaccurate"
                  className="flex items-center justify-center flex-2"
                  disabled={!areTabsEnabled}
                >
                  <XCircle size={20} /> Inaccurate
                </TabsTrigger>
                <TabsTrigger
                  value="Unhelpful"
                  className="lex items-center justify-center flex-2"
                  disabled={!areTabsEnabled}
                >
                  <FileQuestion size={20} /> Unhelpful
                </TabsTrigger>
              </TabsList>
            </Tabs>

          </div>

                <div className="btn-container">
                    <button type="button" className="btn" onClick={handleSubmit}>Submit</button>
                    <button type="button" className="btn" onClick={props.onClose}>Close</button>
                </div>
            </div>
        </div>
    );
}