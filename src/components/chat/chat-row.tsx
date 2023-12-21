"use client";
import { ChatRole } from "@/features/chat/chat-services/models";
import { isNotNullOrEmpty } from "@/features/chat/chat-services/utils";
import { cn } from "@/lib/utils";
import { CheckIcon, ClipboardIcon, UserCircle, ThumbsUp, ThumbsDown } from "lucide-react";
import { FC, useState} from "react";
import { Markdown } from "../markdown/markdown";
import Typography from "../typography";
import { Avatar, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import Modal from "../ui/modal"
import {CreateUserFeedbackChatId} from "@/features/chat/chat-services/chat-service";



interface ChatRowProps {
  chatMessageId: string;
  name: string;
  profilePicture: string;
  message: string;
  type: ChatRole;
}

 export const ChatRow: FC<ChatRowProps> = (props) => {
  const [isIconChecked, setIsIconChecked] = useState(false);
  const [thumbsUpClicked, setThumbsUpClicked] = useState(false);
  const [thumbsDownClicked, setThumbsDownClicked] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [reason, setReason] = useState('');

  
  const toggleButton = (buttonId: string) => {
    switch (buttonId) {
        case 'thumbsUp':
            setThumbsUpClicked(prevState => !prevState);
            setThumbsDownClicked(false);
            setIsIconChecked(false);
            break;
        case 'thumbsDown':
            setThumbsDownClicked(prevState => !prevState);
            break;
        case 'CopyButton':
          setIsIconChecked(prevState => !prevState);
          setThumbsUpClicked(false);
          setThumbsDownClicked(false);
            break;
        // Add more cases for other buttons if needed
        default:
            break;
    }
};

  const handleCopyButton = () => {
    toggleButton('thumbsUp');
    navigator.clipboard.writeText(props.message);
    // setThumbsUpClicked(false);
    // setThumbsDownClicked(false);
    // setIsIconChecked(true);
  };

  const handleModalSubmit = ( feedback: string, reason: string) => {
    setFeedback(feedback);
    setReason(reason);
    setIsModalOpen(false);
    CreateUserFeedbackChatId(props.chatMessageId,  feedback, reason);
    // props.feedback = feedback;
    // props.reason = reason;

  };


  const openModal = () => {
    toggleButton('thumbsDown');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const buttonStyleThumbsUp = {
    backgroundColor: thumbsUpClicked ? 'lightblue' : 'transparent',
  } as React.CSSProperties;

  const buttonStyleThumbsDown = {
    backgroundColor: thumbsDownClicked ? 'lightblue' : 'transparent',
  } as React.CSSProperties;


  const handleThumbsUpClick = () => {
    toggleButton('thumbsUp');
    // setThumbsUpClicked(true);
    // setThumbsDownClicked(false);
    // setIsIconChecked(false);

  };

  return (
    <div
      className={cn(
        "container mx-auto max-w-4xl py-6 flex flex-col ",
        props.type === "assistant" ? "items-start" : "items-end"
      )}
    >
      <div
        className={cn(
          "flex flex-col  max-w-[690px] border rounded-lg overflow-hidden  p-4 gap-8"
        )}
      >
        <div className="flex flex-1">
          <div className="flex gap-4 items-center flex-1">
            <div className="">
              {isNotNullOrEmpty(props.profilePicture) ? (
                <Avatar>
                  <AvatarImage src={props.profilePicture} />
                </Avatar>
              ) : (
                <UserCircle
                  width={40}
                  height={40}
                  strokeWidth={1.2}
                  className="text-primary"
                />
              )}
            </div>
            <Typography variant="h5" className="capitalize text-sm">
              {props.name}
            </Typography>
          </div>
          <Button
            variant={"ghost"}
            size={"sm"}
            title="Thumbs up"
            className="justify-right flex"
            onClick={handleThumbsUpClick}
            style={buttonStyleThumbsUp}
          >
            {isIconChecked ? (
              <CheckIcon size={16} />
            ) : (
              <ThumbsUp size={16} />
            )}
          </Button>

          <Button
            variant={"ghost"}
            size={"sm"}
            title="Thumbs down"
            className="justify-right flex"
            onClick={openModal}
          >
            {isIconChecked ? (
              <CheckIcon size={16} />
            ) : (
              <ThumbsDown size={16} />
            )}
          </Button>
          <Modal  chatThreadId={props.chatMessageId}
                  open={isModalOpen}
                  onClose={closeModal}
                  onSubmit={handleModalSubmit}
                  onFeedbackReceived={(feedback) => {
                    console.log("Received Feedback:", feedback); // Log received feedback
                    // You can do further processing here with the received feedback
                  }}
                  onReasonReceived={(reason) => {
                    console.log("Received Feedback:", reason); // Log received feedback
                    // You can do further processing here with the received feedback
                  }}
                  
          />


          <Button
            variant={"ghost"}
            size={"sm"}
            title="Copy text"
            className="justify-right flex"
            onClick={handleCopyButton}
          >
            {isIconChecked ? (
              <CheckIcon size={16} />
            ) : (
              <ClipboardIcon size={16} />
            )}
          </Button>
        </div>
        <div
          className={cn(
            "-m-4 p-4 prose prose-slate dark:prose-invert break-words prose-p:leading-relaxed prose-pre:p-0 max-w-non",
            props.type === "assistant"
              ? "bg-secondary"
              : "bg-primary text-white"
          )}
        >
          <Markdown content={props.message} />
        </div>
      </div>
    </div>
  );
};

export default ChatRow;
