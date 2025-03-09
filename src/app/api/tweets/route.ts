import { NextResponse } from 'next/server';
import prisma from '@/libs/prismadb';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/libs/auth';

export async function GET(req: Request) {
  try {
    const tweets = await prisma.tweet.findMany({
      include: {
        user: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(tweets);
  } catch (error) {
    console.error(error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.username) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await req.json();
    const { content } = body;

    if (!content) {
      return new NextResponse('Missing content', { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: {
        username: session.user.username
      }
    });

    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }

    const tweet = await prisma.tweet.create({
      data: {
        body: content,
        userId: user.id
      }
    });

    return NextResponse.json(tweet);
  } catch (error) {
    console.error(error);
    return new NextResponse('Internal Error', { status: 500 });
  }
} 