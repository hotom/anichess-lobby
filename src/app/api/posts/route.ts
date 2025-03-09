import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/auth';
import prisma from '@/libs/prismadb';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

export async function GET(req: Request) {
  try {
    console.log('Fetching posts...');
    const posts = await prisma.post.findMany({
      include: {
        user: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    console.log(`Successfully fetched ${posts.length} posts`);
    return NextResponse.json(posts);
  } catch (error) {
    console.error('Error in GET /api/posts:', error);
    if (error instanceof Error) {
      return new NextResponse(error.message, { status: 500 });
    }
    return new NextResponse('Failed to fetch posts', { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    console.log('Starting post creation...');
    const session = await getServerSession(authOptions);
    console.log('Session:', session);

    if (!session?.user?.username) {
      console.log('Unauthorized: No session or username');
      return new NextResponse('Unauthorized', { status: 401 });
    }

    console.log('Processing form data...');
    const formData = await req.formData();
    const body = formData.get('body') as string;
    const imageFile = formData.get('image') as File | null;

    if (!body) {
      console.log('Missing required field: body');
      return new NextResponse('Missing required fields', { status: 400 });
    }

    console.log('Finding user...');
    const user = await prisma.user.findUnique({
      where: {
        username: session.user.username,
      },
    });

    if (!user) {
      console.log('User not found for username:', session.user.username);
      return new NextResponse(
        'User not found. Please make sure you have created a user profile with a username before posting.',
        { status: 404 }
      );
    }

    let imageUrl = null;
    if (imageFile) {
      console.log('Processing image file...');
      // Validate file type
      if (!imageFile.type.startsWith('image/')) {
        console.log('Invalid file type:', imageFile.type);
        return new NextResponse('Invalid file type. Only images are allowed.', { status: 400 });
      }

      // Validate file size (5MB limit)
      if (imageFile.size > 5 * 1024 * 1024) {
        console.log('File too large:', imageFile.size);
        return new NextResponse('File size too large. Maximum size is 5MB.', { status: 400 });
      }

      // Ensure uploads directory exists
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
      if (!existsSync(uploadsDir)) {
        console.log('Creating uploads directory...');
        await mkdir(uploadsDir, { recursive: true });
      }

      // Generate unique filename
      const timestamp = Date.now();
      const randomNum = Math.floor(Math.random() * 10000);
      const fileExtension = imageFile.name.split('.').pop();
      const filename = `post_${timestamp}_${randomNum}.${fileExtension}`;
      const filepath = path.join(uploadsDir, filename);

      console.log('Saving image file:', filename);
      // Save the file
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      await writeFile(filepath, buffer);

      // Set the image URL
      imageUrl = `/uploads/${filename}`;
      console.log('Image URL set:', imageUrl);
    }

    console.log('Creating post in database...');
    const post = await prisma.post.create({
      data: {
        body,
        image: imageUrl,
        userId: user.id,
        likedIds: [],
      },
      include: {
        user: true,
      },
    });

    console.log('Post created successfully:', post.id);
    return NextResponse.json(post);
  } catch (error) {
    console.error('Error in POST /api/posts:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      return new NextResponse(error.message, { status: 500 });
    }
    return new NextResponse('Failed to create post', { status: 500 });
  }
} 