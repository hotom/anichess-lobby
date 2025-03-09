import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/libs/auth';
import prisma from '@/libs/prismadb';
import { supabase } from '@/libs/supabase';

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

      // Generate unique filename
      const timestamp = Date.now();
      const randomNum = Math.floor(Math.random() * 1E9);
      const fileExtension = imageFile.name.substring(imageFile.name.lastIndexOf('.')).toLowerCase();
      const filename = `${session.user.username}-${timestamp}_${randomNum}${fileExtension}`;

      console.log('Uploading to Supabase:', filename);

      // Upload to Supabase Storage
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      const { data, error } = await supabase.storage
        .from('uploads')
        .upload(filename, buffer, {
          contentType: imageFile.type,
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Supabase Storage error:', error);
        return NextResponse.json({ 
          error: "Failed to upload file",
          details: error.message 
        }, { status: 500 });
      }

      console.log('Upload successful:', data);

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('uploads')
        .getPublicUrl(filename);

      imageUrl = publicUrl;
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