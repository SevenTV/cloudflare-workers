import {
  ApplicationCommand,
  InteractionHandler,
  InteractionResponse,
  InteractionResponseType,
} from "../types";

const command: ApplicationCommand = {
  name: "ping",
  description: "Ping the bot",
};

const handler: InteractionHandler = async (
  interaction
): Promise<InteractionResponse> => {
  return {
    type: InteractionResponseType.ChannelMessageWithSource,
    data: {
      content: `Pong <@!${interaction.member.user.id}>!`,
    },
  };
};

export default [command, handler] as [ApplicationCommand, InteractionHandler];
