import { Router } from "itty-router";
import { JSONResponse } from "./response";
import { registerGlobalCommands } from "./register";
import { DiscordMessage, Env } from "./types";
import { handleCommand } from "./commands";

const router = Router();

/**
 * A simple :wave: hello page to verify the worker is working.
 */
router.get("/", (request: Request, env: Env) => {
  return new Response(`👋 ${env.DISCORD_APPLICATION_ID}`);
});

/**
 * Main route for all requests sent from Discord.  All incoming messages will
 * include a JSON payload described here:
 * https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object
 */
router.post("/", async (request: Request, env: Env) => {
  return await handleCommand(request, env);
});

router.get("/register", async (request: Request, env: Env) => {
  // validate auth token
  const token = request.headers.get("Authorization");
  if (!token || token !== env.AUTH_TOKEN) {
    return new Response("Unauthorized", {
      status: 401,
    });
  }

  return await registerGlobalCommands(env);
});

router.all("*", () => new Response("Not Found.", { status: 404 }));

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext) {
    return router.handle(request, env);
  },
};
