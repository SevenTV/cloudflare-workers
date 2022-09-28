import {
  Env,
  ApplicationCommand,
  InteractionHandler,
  InteractionResponse,
  InteractionResponseType,
} from "../types";

async function createIncident(
  env: Env,
  name: string,
  summary: string,
  requester_email: string,
  description: string,
  policy_id: string
) {
  try {
    const response = await fetch("https://betteruptime.com/api/v2/incidents", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.BETTER_UPTIME_AUTH_TOKEN}`,
      },
      body: JSON.stringify({
        name,
        summary,
        requester_email,
        description,
        policy_id,
      }),
    });

    return response.ok;
  } catch {
    return false;
  }
}

const command: ApplicationCommand = {
  name: "summon",
  description: "Summon one of the 7tv staff members",
  options: [
    {
      name: "staff",
      description: "The staff member you want to summon",
      type: 3,
      required: true,
      choices: [
        {
          name: "Anatole",
          value: "anatole",
        },
        {
          name: "Kathy",
          value: "kathy",
        },
        {
          name: "Troy",
          value: "troy",
        },
      ],
    },
    {
      name: "reason",
      description: "The reason you want to summon the staff member",
      type: 3,
    },
  ],
};

const handler: InteractionHandler = async (
  interaction,
  env
): Promise<InteractionResponse> => {
  let success = false;
  let summonedUser = "";
  const user = interaction.member.user;
  const reason =
    interaction.data!.options!.find((option) => option.name === "reason")
      ?.value || "No reason provided";
  const staff =
    interaction.data!.options!.find((option) => option.name === "staff")
      ?.value || "";

  switch (staff) {
    case "anatole":
      // 91500
      success = await createIncident(
        env,
        "7TV Monitoring Bot Summon",
        "Summon Anatole",
        "system@7tv.app",
        `Anatole summoned by ${user.username}#${user.discriminator} (${user.id})\nReason: ${reason}`,
        "91500"
      );
      summonedUser = "<@!61076301552820224>";
      break;
    case "kathy":
      // 91502
      success = await createIncident(
        env,
        "7TV Monitoring Bot Summon",
        "Summon Kathy",
        "system@7tv.app",
        `Kathy summoned by ${user.username}#${user.discriminator} (${user.id})\nReason: ${reason}`,
        "91502"
      );
      summonedUser = "<@!347224572661071872>";
      break;
    case "troy":
      // 91501
      success = await createIncident(
        env,
        "7TV Monitoring Bot Summon",
        "Summon Troy",
        "system@7tv.app",
        `Troy summoned by ${user.username}#${user.discriminator} (${user.id})\nReason: ${reason}`,
        "91501"
      );
      summonedUser = "<@!383195095610163200>";
      break;
    default:
      return {
        type: InteractionResponseType.ChannelMessageWithSource,
        data: {
          flags: 64,
          content: `We could not find a staff member with the name ${staff}`,
        },
      };
  }

  if (success) {
    return {
      type: InteractionResponseType.ChannelMessageWithSource,
      data: {
        content: `<@!${user.id}> has summoned ${summonedUser}!`,
      },
    };
  }

  return {
    type: InteractionResponseType.ChannelMessageWithSource,
    data: {
      content: `Failed to summon ${summonedUser}!`,
    },
  };
};

export default [command, handler] as [ApplicationCommand, InteractionHandler];
