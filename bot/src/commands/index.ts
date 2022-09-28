import ping from "./ping";
import summon from "./summon";
import { verify } from "../noble-ed25519";
import { JSONResponse } from "../response";
import {
  Env,
  Interaction,
  InteractionResponseType,
  InteractionType,
} from "../types";

export const COMMANDS = [ping, summon];

const validate = (publicKey: string) => async (request: Request, body: string) => {
  const signature = String(request.headers.get("X-Signature-Ed25519"));
  const timestamp = String(request.headers.get("X-Signature-Timestamp"));
  return await verify(signature, new TextEncoder().encode(timestamp + body), publicKey);
};

export const handleCommand = async (
  request: Request,
  env: Env
): Promise<Response> => {
  const body = await request.text();

  if (request.method === "POST") {
    const isValid = await validate(env.DISCORD_PUBLIC_KEY)(request, body);
    if (!isValid) {
      return new Response("Unauthorized", {
        status: 401,
      });
    }
  }

  const interaction: Interaction = JSON.parse(body);

  switch (interaction.type) {
    case InteractionType.Ping:
      return new JSONResponse({
        type: InteractionResponseType.Pong,
      });
    case InteractionType.ApplicationCommand:
      const command = COMMANDS.find(
        (command) => command[0].name === interaction.data!.name
      );
      if (!command) {
        return new JSONResponse(
          {
            type: InteractionResponseType.ChannelMessageWithSource,
            data: {
              content: "Unknown command",
            },
          },
          { status: 400 }
        );
      }

      return new JSONResponse(await command[1](interaction, env));
  }

  return new JSONResponse(
    { error: "Unknown interaction type" },
    { status: 400 }
  );
};
