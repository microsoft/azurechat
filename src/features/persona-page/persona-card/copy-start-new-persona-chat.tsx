"use client";
import { Button } from "@/features/ui/button";
import {ClipboardCheckIcon, LinkIcon} from "lucide-react";
import {FC, useEffect, useState} from "react";

interface Props {
    id: string;
}

export const CopyStartNewPersonaChat: FC<Props> = (props) => {
    const id = props.id;
    const [hostUrl, setHostUrl] = useState("");
    const [isIconChecked, setIsIconChecked] = useState(false);

    useEffect(() => {
        if (id) {
            setHostUrl(window.location.origin);
        }
    }, [id]);

    const handleButtonClick = () => {
        if(hostUrl && id) {
            const urlToCopy = `${hostUrl}/chat/create/persona/${id}`
            navigator.clipboard.writeText(urlToCopy).then(() => {setIsIconChecked(true);});
        }
    };

    return (
        <Button
            variant={"outline"}
            title="Copy start chat url"
            onClick={handleButtonClick}
        >
            {isIconChecked ? (
                <ClipboardCheckIcon size={18} />
            ) : (
                <LinkIcon size={18} />
            )}
        </Button>
    );
};