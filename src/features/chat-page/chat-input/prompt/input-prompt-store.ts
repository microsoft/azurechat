import { PromptModel } from "@/features/prompt-page/models";
import { FindAllPrompts } from "@/features/prompt-page/prompt-service";
import { proxy, useSnapshot } from "valtio";
import { chatStore } from "../../chat-store";
import { SetInputRowsToMax } from "../use-chat-input-dynamic-height";

class InputPromptState {
  public errors: string[] = [];
  public prompts: Array<PromptModel> = [];
  public isOpened: boolean = false;
  public isLoading: boolean = false;

  public async openPrompt() {
    this.isOpened = true;
    this.isLoading = true;
    this.errors = [];

    const response = await FindAllPrompts();

    if (response.status === "OK") {
      this.prompts = response.response;
    } else {
      this.errors = response.errors.map((e) => e.message);
    }

    this.isLoading = false;
  }

  public updateOpened(value: boolean) {
    this.isOpened = value;
  }

  public updateErrors(errors: string[]) {
    this.errors = errors;
  }

  public selectPrompt(prompt: PromptModel) {
    chatStore.updateInput(prompt.description);
    this.isOpened = false;
    this.errors = [];
    SetInputRowsToMax();
  }
}

export const inputPromptStore = proxy(new InputPromptState());

export const useInputPromptState = () => {
  return useSnapshot(inputPromptStore, {
    sync: true,
  });
};
