export interface Env {
  AUTH_TOKEN: string;

  DISCORD_TOKEN: string;
  DISCORD_PUBLIC_KEY: string;
  DISCORD_MOD_ROLE_ID: string;
  DISCORD_APPLICATION_ID: string;

  BETTER_UPTIME_AUTH_TOKEN: string;
}

export interface DiscordMessage {
  type: InteractionType;
  member: {
    user: {
      id: string;
      username: string;
      avatar: string;
      discriminator: string;
      public_flags: number;
    };
    roles: string[];
    premium_since: string | null;
    premissions: string;
    pending: boolean;
    nick: string | null;
    mute: boolean;
    joined_at: string;
    is_pending: boolean;
    deaf: boolean;
  };
  id: string;
  guild_id: string;
  app_permissions: string;
  guild_locale: string;
  locale: string;
  data: {
    type: number;
    id: string;
    name: string;
    options: {
      type: number;
      name: string;
      value: string;
    }[];
  };
  channel_id: string;
}

export enum ApplicationCommandOptionType {
  SUB_COMMAND = 1,
  SUB_COMMAND_GROUP = 2,
  STRING = 3,
  INTEGER = 4,
  BOOLEAN = 5,
  USER = 6,
  CHANNEL = 7,
  ROLE = 8,
}
export type ApplicationCommandOptionChoice = {
  name: string;
  value: string | number;
};
export type ApplicationCommandOption = {
  type: ApplicationCommandOptionType;
  name: string;
  description: string;
  default?: boolean;
  required?: boolean;
  choices?: ApplicationCommandOptionChoice[];
  options?: ApplicationCommandOption[];
};
export type ApplicationCommand = {
  name: string;
  description: string;
  options?: ApplicationCommandOption[];
};
export type Snowflake = string;
export enum InteractionType {
  Ping = 1,
  ApplicationCommand = 2,
}
export type OptionType = any;
export type ApplicationCommandInteractionDataOption = {
  name: string;
  value?: OptionType;
  options?: ApplicationCommandInteractionDataOption[];
};
export type ApplicationCommandInteractionData = {
  id: Snowflake;
  name: string;
  options?: ApplicationCommandInteractionDataOption[];
};
export type GuildMember = {
  deaf: boolean;
  is_pending: boolean;
  joined_at: string;
  mute: boolean;
  nick?: string;
  pending: boolean;
  permissions: string;
  premium_since?: string;
  roles: string[];
  user: {
    avatar?: string;
    discriminator: string;
    id: string;
    public_flags: number;
    username: string;
  };
};
export type Interaction = {
  id: Snowflake;
  type: InteractionType;
  data?: ApplicationCommandInteractionData;
  guild_id: Snowflake;
  channel_id: Snowflake;
  member: GuildMember;
  token: string;
  version: number;
};
export enum InteractionResponseType {
  Pong = 1,
  Acknowledge = 2,
  ChannelMessage = 3,
  ChannelMessageWithSource = 4,
  AcknowledgeWithSource = 5,
}
export enum AllowedMentionTypes {
  roles = "roles",
  users = "users",
  everyone = "everyone",
}
export type AllowedMentions = {
  parse?: AllowedMentionTypes[];
  roles?: Snowflake[];
  users?: Snowflake[];
  replied_user?: boolean;
};
export enum EmbedType {
  rich = "rich",
  image = "image",
  video = "video",
  gifv = "gifv",
  article = "article",
  link = "link",
}
export type EmbedThumbnail = {
  url?: string;
  proxy_url?: string;
  height?: number;
  width?: number;
};
export type EmbedVideo = {
  url?: string;
  height?: number;
  width?: number;
};
export type EmbedImage = {
  url?: string;
  proxy_url?: string;
  height?: number;
  width?: number;
};
export type EmbedProvider = {
  name?: string;
  url?: string;
};
export type EmbedAuthor = {
  name?: string;
  url?: string;
  icon_url?: string;
  proxy_icon_url?: string;
};
export type EmbedFooter = {
  text: string;
  icon_url?: string;
  proxy_icon_url?: string;
};
export type EmbedField = {
  name: string;
  value: string;
  inline?: boolean;
};
export type Embed = {
  title?: string;
  type?: EmbedType;
  description?: string;
  url?: string;
  timestamp?: string;
  color?: number;
  footer?: EmbedFooter;
  image?: EmbedImage;
  thumbnail?: EmbedThumbnail;
  video?: EmbedVideo;
  provider?: EmbedProvider;
  author?: EmbedAuthor;
  fields?: EmbedField[];
};
export type InteractionApplicationCommandCallbackData = {
  tts?: boolean;
  content: string;
  embeds?: Embed[];
  allowed_mentions?: AllowedMentions;
  flags?: number;
};
export type InteractionResponse = {
  type: InteractionResponseType;
  data?: InteractionApplicationCommandCallbackData;
};
export type InteractionHandler = (
  interaction: Interaction,
  env: Env
) => Promise<InteractionResponse> | InteractionResponse;
