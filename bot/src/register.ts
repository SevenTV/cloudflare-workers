import { COMMANDS } from "./commands";
import { JSONResponse } from "./response";
import { Env } from "./types";

export async function registerGlobalCommands(env: Env) {
  return await registerCommands(
    env,
    `https://discord.com/api/v10/applications/${env.DISCORD_APPLICATION_ID}/commands`
  );
}

async function registerCommands(env: Env, url: string) {
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bot ${env.DISCORD_TOKEN}`,
    },

    method: "PUT",
    body: JSON.stringify(COMMANDS.map((command) => command[0])),
  });

  if (response.ok) {
    return new JSONResponse({ status: "ok" });
  }

  return new JSONResponse(
    { status: "error", error: await response.text() },
    { status: 500 }
  );
}
