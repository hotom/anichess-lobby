import { NextResponse } from "next/server";
import prisma from "@/libs/prismadb";

export async function GET(
  req: Request,
  { params }: { params: { username: string } }
) {
  try {
    const { username } = params;

    const user = await prisma.user.findUnique({
      where: { username }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const followers = await prisma.user.findMany({
      where: {
        id: {
          in: user.followerIds || []
        }
      },
      select: {
        id: true,
        name: true,
        username: true,
        image: true,
        profileImage: true,
        followingIds: true,
        followerIds: true,
      }
    });

    return NextResponse.json(followers);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
} 