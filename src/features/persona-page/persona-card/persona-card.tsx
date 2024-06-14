import { FC } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../ui/card";
import { PersonaModel } from "../persona-services/models";
import { PersonaCardContextMenu } from "./persona-card-context-menu";
import { ViewPersona } from "./persona-view";
import { StartNewPersonaChat } from "./start-new-persona-chat";

interface Props {
  persona: PersonaModel;
  showContextMenu: boolean;
}

export const PersonaCard: FC<Props> = (props) => {
  const colors = [
    "#FFA51F",
    "#FF5F5F",
    "#00DE9C",
    "#FF5A4F",
    "#297FF1",
    "#40E0D0",
    "#8E66FF",
    "#1ABC9C",
    "#8E44AD",
    "#FFC107",
    "#E91E63",
    "#CDDC39",
    "#4F66E9",
    "#DC143C",
  ];

  const getRandomColor = () =>
    colors[Math.floor(Math.random() * colors.length)];

  const { persona } = props;
  return (
    <Card
      key={persona.id}
      className="flex flex-col gap-4 h-auto items-start text-start justify-start dark:bg-opacity-5 dark:bg-[#FFFFFF]  dark:hover:border-fuchsia-400 hover:border-fuchsia-400"
    >
      <CardHeader className="flex flex-row pb-0 w-full items-center">
        <CardTitle
          className="flex-1 text-base"
          style={{ color: getRandomColor() }}
        >
          {persona.name}
        </CardTitle>
        {props.showContextMenu && (
          <div>
            <PersonaCardContextMenu persona={persona} />
          </div>
        )}
      </CardHeader>
      <CardContent className="text-muted-foreground flex-1 text-sm">
        {persona.description.length > 100
          ? persona.description.slice(0, 100).concat("...")
          : persona.description}
      </CardContent>
      <CardFooter className="content-stretch w-full gap-8">
        {props.showContextMenu && <ViewPersona persona={persona} />}

        <StartNewPersonaChat persona={persona} />
      </CardFooter>
    </Card>
  );
};
