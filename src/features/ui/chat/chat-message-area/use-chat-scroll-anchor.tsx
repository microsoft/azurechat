import { chatStore, useChat } from "@/features/chat-page/chat-store";
import { RefObject, useEffect } from "react";

export const useChatScrollAnchor = (props: {
  ref: RefObject<HTMLDivElement>;
}) => {
  const { ref } = props;

  const { autoScroll } = useChat();

  // This effect handles the user's scroll event
  useEffect(() => {
    const handleUserScroll = () => {
      if (ref.current) {
        const userScrolledUp =
          ref.current.scrollTop + ref.current.clientHeight <
          ref.current.scrollHeight;

        chatStore.updateAutoScroll(!userScrolledUp);
      }
    };

    ref.current?.addEventListener("scroll", handleUserScroll);

    // Cleanup: remove the event listener when the component unmounts or the dependencies change
    return () => {
      ref.current?.removeEventListener("scroll", handleUserScroll);
    };
  }, [ref]);

  // This effect handles the automatic scroll to bottom
  useEffect(() => {
    const handleAutoScroll = () => {
      if (ref.current && autoScroll) {
        ref.current.scrollTop = ref.current.scrollHeight;
      }
    };

    const observer = new MutationObserver(handleAutoScroll);

    if (ref.current) {
      observer.observe(ref.current, { childList: true, subtree: true });
    }

    // Cleanup: disconnect the observer when the component unmounts or the dependencies change
    return () => {
      observer.disconnect();
    };
  }, [ref, autoScroll]);
};
