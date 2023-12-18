"use client";
import { MenuItem } from "@/components/menu";
import { Button } from "@/components/ui/button";
import { useGlobalMessageContext } from "@/features/global-message/global-message-context";
import { FileText, MessageCircle, Trash, Pencil} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { FC } from "react";
import { ChatThreadModel } from "../chat-services/models";
import {RenameChatThreadByID} from "@/features/chat/chat-services/chat-thread-service";
import React, { useState } from 'react';

interface Prop {
  menuItems: Array<ChatThreadModel>;
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newTitle: string) => void;
}

const PopupMessage: React.FC<{ message: string }> = ({ message }) => {
  return (
    <div className="popup-message">
      <p>{message}</p>
    </div>
  );
};

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, onSave }) => {
  const [newName, setNewName] = useState('');
  const [showPopup, setShowPopup] = useState(false);

  const handleSave = () => {
    onSave(newName);
    onClose();

    setShowPopup(true);
    setTimeout(() => {
      setShowPopup(false);
    }, 2000);
  };

  return (
    <>
      {isOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <label>
              Enter The New Chat Name:
              <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} />
            </label>
            <button onClick={handleSave}>Save</button>
            <button onClick={onClose}>Cancel</button>
          </div>
          {showPopup && <PopupMessage message="Chat name updated successfully!" />}
        </div>
      )}
    </>
  );
};


 export const MenuItems: FC<Prop> = (props) => {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { showError } = useGlobalMessageContext();

  const [modalPosition, setModalPosition] = useState<{ top: number; left: number } | null>(null);
  const handleOpenModal = (threadId: string) => {
    
    const top = window.innerHeight / 2 - 100; 
    const left = window.innerWidth / 2 - 150; 
    setModalPosition({ top, left });
    setSelectedThreadId(threadId);
    
  };

    const renameChat = async (threadID: string, newTitle: string| Promise<string> | null) => {
    try {
      await RenameChatThreadByID(threadID, newTitle);
      router.refresh();
      router.replace("/chat");
    
    } catch (e) {
      console.error(e);
      showError("" + e);
    }
  };

  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);

  const handleCloseModal = () => {
    setSelectedThreadId(null);
  };

  const handleSaveModal = async (newName: string) => {
    if (newName.trim() !== '' && selectedThreadId) {
      await renameChat(selectedThreadId, newName);
    }
  };

  return (
    <>
      {props.menuItems.map((thread, index) => (
        <MenuItem
          href={"/chat/" + thread.id}
          isSelected={id === thread.id}
          key={index}
          className="justify-between group/item"
        >
          {thread.chatType === "data" ? (
            <FileText
              size={16}
              className={id === thread.id ? " text-brand" : ""}
            />
          ) : (
            <MessageCircle
              size={16}
              className={id === thread.id ? " text-brand" : ""}
            />
          )}

          <span className="flex gap-2 items-center overflow-hidden flex-1">
            <span className="overflow-ellipsis truncate"> {thread.name}</span>
          </span>

        <Button
            className="invisible group-hover/item:visible hover:text-brand"
            size={"sm"}
            variant={"ghost"}
            onClick={() => handleOpenModal(thread.id)}
          >
            <Pencil size={16} />
          </Button>

        {selectedThreadId === thread.id && (

          <Modal
          isOpen={selectedThreadId === thread.id}
          onClose={handleCloseModal}
          onSave={handleSaveModal}
        />
      )}
    </MenuItem>
  ))}
</>
);
};      