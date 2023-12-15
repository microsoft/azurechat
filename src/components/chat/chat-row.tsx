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
import Modal from "../ui/modal";

interface ChatRowProps {
  name: string;
  profilePicture: string;
  message: string;
  type: ChatRole;
}

const ChatRow: FC<ChatRowProps> = (props) => {
  const [isIconChecked, setIsIconChecked] = useState(false);
  const [thumbsUpClicked, setThumbsUpClicked] = useState(false);
  const [thumbsDownClicked, setThumbsDownClicked] = useState(false)
  const [showModal, setShowModal] = useState(false);
  
  const toggleIcon = () => {
    setIsIconChecked((prevState) => !prevState);
    
  };

  const handleButtonClick = () => {
    toggleIcon();
    navigator.clipboard.writeText(props.message);
  };

//   function toggleModal() {
//     setShowModal(!showModal);
// }

  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const buttonStyleThumbsUp = {
    backgroundColor: thumbsUpClicked ? 'lightblue' : 'transparent',
    // Other styles for thumbs up button
  } as React.CSSProperties;

  const buttonStyleThumbsDown = {
    backgroundColor: thumbsDownClicked ? 'lightblue' : 'transparent',
    // Other styles for thumbs down button
  } as React.CSSProperties;


  const handleThumbsUpClick = () => {
    setThumbsUpClicked(true);
    setThumbsDownClicked(false);

  };

  // const handleThumbsDownClick = () => {
  //   // setThumbsDownClicked(true);
  //   // setThumbsUpClicked(false);
  //   // const confirmation = window.prompt('Please enter a reason for thumbs down:');

  //   // if (confirmation !== null) {
  //   //   setThumbsDownClicked(true);
  //   //   setThumbsUpClicked(false); // Reset the state of the other button
  //   //   // ... any other logic you want to execute for thumbs down
  //   //   console.log('Reason for thumbs down:', confirmation);
  //   // }

    
  //   return (
  //     <>
  //         {/* <Modal open={true} onClose={toggleModal}>
  //             <div>
  //                 Main Content goes here!
  //             </div>
  //         </Modal> */}
  //         ...
  //     </>
  // );


  // };



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
          <Modal open={isModalOpen} onClose={closeModal}>
          {/* Content for your modal */}
          <p>Modal content goes here.</p>
          </Modal>
          <Button
            variant={"ghost"}
            size={"sm"}
            title="Copy text"
            className="justify-right flex"
            onClick={handleButtonClick}
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
