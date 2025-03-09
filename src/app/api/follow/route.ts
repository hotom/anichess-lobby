import { NextResponse } from "next/server";
import prisma from "@/libs/prismadb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { userId } = await req.json();
    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const followingIds = user.followingIds || [];
    const isFollowing = followingIds.includes(userId);

    let updatedFollowingIds = isFollowing
      ? followingIds.filter((id) => id !== userId)
      : [...followingIds, userId];

    // Update the current user's following list
    await prisma.user.update({
      where: { id: session.user.id },
      data: { followingIds: updatedFollowingIds }
    });

    // Update the target user's followers list
    const targetUser = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (targetUser) {
      const followerIds = targetUser.followerIds || [];
      const updatedFollowerIds = isFollowing
        ? followerIds.filter((id) => id !== session.user.id)
        : [...followerIds, session.user.id];

      await prisma.user.update({
        where: { id: userId },
        data: { followerIds: updatedFollowerIds }
      });
    }

    return NextResponse.json({ following: !isFollowing });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
} 