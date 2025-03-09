import { NextResponse } from 'next/server';
import prisma from '@/libs/prismadb';

export async function GET(
  req: Request,
  { params }: { params: { username: string } }
) {
  try {
    const { username } = params;

    if (!username) {
      return new NextResponse('Username is required', { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: {
        username
      }
    });

    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }

    const tweets = await prisma.tweet.findMany({
      where: {
        userId: user.id
      },
      include: {
        user: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({ user, tweets });
  } catch (error) {
    console.error(error);
    return new NextResponse('Internal Error', { status: 500 });
  }
} 