import { redirect } from "next/navigation";

export async function GET() {
    const DISCORD_GUILD_INVITE = process.env.DISCORD_GUILD_INVITE as string;
    redirect(DISCORD_GUILD_INVITE);
};