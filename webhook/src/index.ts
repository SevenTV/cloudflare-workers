export interface Env {
  AUTH_TOKEN: string;
  BETTER_UPTIME_AUTH_TOKEN: string;

  DISCORD_WEBHOOK_URL: string;

  DISCORD_NEW_INCIDENT_MESSAGE: string;
  DISCORD_INCIDENT_RESOLVED_MESSAGE: string;
  DISCORD_INCIDENT_UPDATE_MESSAGE: string;
}

interface EventBody {
  id: string;
  team_id: string;
  type: string;
}

interface Incident {
  data: {
    id: string;
    type: string;
    attributes: {
      name: string;
      url: string;
      http_method: string;
      cause: string;
      incident_group_id: string;
      started_at: string;
      acknowledged_at: string | null;
      acknowledged_by: string | null;
      resolved_at: string | null;
      resolved_by: string | null;
      response_content: string;
      response_options: string;
      regions: string[];
      response_url: string | null;
      screenshot_url: string;
      escalation_policy_id: string | null;
      call: boolean;
      sms: boolean;
      email: boolean;
      push: boolean;
    };
    relationships: {
      monitor: {
        data: {
          id: string;
          type: string;
        };
      };
    };
  };
  included: {
    id: string;
    type: string;
    attributes: {
      url: string;
      pronounceable_name: string;
      monitor_type: string;
      monitor_group_id: string | null;
      last_checked_at: string;
      status: string;
      policy_id: string | null;
      required_keyword: string | null;
      verify_ssl: boolean;
      check_frequency: number;
      call: boolean;
      sms: boolean;
      email: boolean;
      push: boolean;
      team_wait: string | null;
      http_method: string;
      request_timeout: number;
      recovery_period: number;
      request_headers: string[];
      request_body: string;
      follow_redirects: boolean;
      remember_cookies: boolean;
      created_at: string;
      updated_at: string;
      ssl_expiration: string | null;
      domain_expiration: string | null;
      regions: string[];
      expected_status_codes: string[];
      port: string | null;
      confirmation_period: number;
      paused_at: string | null;
      paused: boolean;
      maintenance_from: string | null;
      maintenance_to: string | null;
      maintenance_timezone: string;
    };
    relationships: {
      policy: {
        data: string | null;
      };
    };
  }[];
}

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    if (request.headers.get("Authorization") !== env.AUTH_TOKEN) {
      return new Response("Unauthorized", {
        status: 401,
      });
    }

    const body: EventBody | null = await request.json();
    if (!body) {
      return new Response("No body", { status: 400 });
    }

    if (body.type !== "incident") {
      return new Response("Not an incident", { status: 400 });
    }

    const incidentResponse = await fetch(
      `https://betteruptime.com/api/v2/incidents/${body.id}`,
      {
        headers: {
          Authorization: `Bearer ${env.BETTER_UPTIME_AUTH_TOKEN}`,
        },
      }
    );

    if (!incidentResponse.ok) {
      console.error("Failed to fetch incident", await incidentResponse.text());
      return new Response("Failed to fetch incident", {
        status: 500,
      });
    }

    const incident: Incident = await incidentResponse.json();

    const { attributes } = incident.data;

    let wasResolved = false;
    let wasAcknowledged = false;

    if (attributes.acknowledged_at) wasAcknowledged = true;
    if (attributes.resolved_at) wasResolved = true;

    const message = {} as any;
    const embed = {} as any;

    if (!wasAcknowledged && !wasResolved) {
      message.content = env.DISCORD_NEW_INCIDENT_MESSAGE;
      embed.color = 0xff0000; // red
    } else if (wasAcknowledged && !wasResolved) {
      message.content = env.DISCORD_INCIDENT_UPDATE_MESSAGE;
      embed.color = 0xffff00; // yellow
    } else if (wasResolved) {
      message.content = env.DISCORD_INCIDENT_RESOLVED_MESSAGE;
      embed.color = 0x00ff00; // green
    }

    embed.title = attributes.name || "Unnamed incident";
    embed.url = attributes.url;
    embed.description = attributes.cause;
    embed.timestamp = new Date(attributes.started_at).toISOString();

    // If the incident was just created, and a screenshot is available, add it to the embed.
    if (wasResolved) {
      embed.image = {
        url: "https://cdn.7tv.app/emote/62893283ed0a40a5ec5f00d9/4x.gif",
      };
    } else if (wasAcknowledged) {
      embed.image = {
        url: "https://cdn.7tv.app/emote/60ccf4479f5edeff9938fa77/4x.gif",
      };
    } else {
      if (attributes.screenshot_url) {
        embed.image = { url: attributes.screenshot_url };
      } else {
        embed.image = {
          url: "https://cdn.7tv.app/emote/60aeed117e8706b57214d2b2/4x.gif",
        };
      }
    }

    embed.description = `**ID**: ${body.id}\n**Cause**: ${attributes.cause}`;
    if (attributes.url) {
      embed.description += `\n**Checked URL**: \`${attributes.http_method.toUpperCase()} ${
        attributes.url
      }\`\n**Response** \`\`\`${attributes.response_content}\`\`\``;
    }

    if (embed.description.length > 1500) {
      embed.description = embed.description.substring(0, 1500) + "...";
    }

    embed.fields = [];

    if (wasAcknowledged && !wasResolved) {
      embed.fields.push({
        name: "Acknowledged at",
        value: new Date(attributes.acknowledged_at!).toISOString(),
        inline: true,
      });

      embed.fields.push({
        name: "Acknowledged by",
        value: attributes.acknowledged_by || "Unknown",
        inline: true,
      });
    }

    if (wasResolved) {
      embed.fields.push({
        name: "Resolved at",
        value: new Date(attributes.resolved_at!).toISOString(),
        inline: true,
      });

      embed.fields.push({
        name: "Resolved by",
        value: attributes.resolved_by || "Automatically",
        inline: true,
      });
    }

    embed.fields.push({
      name: "View incident",
      value: `[Click here](https://betteruptime.com/team/${body.team_id}/incidents/${body.id}})`,
    });

    message.embeds = [embed];

    const webhookResponse = await fetch(env.DISCORD_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message),
    });

    if (!webhookResponse.ok) {
      console.error(
        "Discord Webhook Failed",
        await webhookResponse.text(),
        message
      );
      return new Response("Webhook failed", { status: 500 });
    }

    return new Response("OK", { status: 200 });
  },
};
