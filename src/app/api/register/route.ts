import bcrypt from 'bcrypt';
import { NextResponse } from 'next/server';
import prisma from '@/libs/prismadb';
import { Prisma } from '@prisma/client';

export async function POST(req: Request) {
  try {
    console.log('Starting registration process...');
    const body = await req.json();
    const { username, password } = body;
    console.log('Received registration data:', { username, hasPassword: !!password });

    if (!username || !password) {
      console.log('Missing required fields');
      return new NextResponse('Username and password are required', { status: 400 });
    }

    // Check if username is taken
    console.log('Checking if username is taken...');
    const existingUser = await prisma.user.findUnique({
      where: { username }
    });

    if (existingUser) {
      console.log('Username already taken');
      return new NextResponse('Username already taken', { status: 400 });
    }

    console.log('Hashing password...');
    const hashedPassword = await bcrypt.hash(password, 12);

    console.log('Creating user in database...');
    const user = await prisma.user.create({
      data: {
        username,
        hashedPassword,
        name: username // Set default name to username
      }
    });

    console.log('User created successfully:', { userId: user.id });
    return NextResponse.json(user);
  } catch (error) {
    console.error('Registration error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    
    // Handle Prisma-specific errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.error('Prisma error code:', error.code);
      
      if (error.code === 'P2002') {
        return new NextResponse('Username already taken', { status: 400 });
      }
    }

    // Handle Prisma initialization errors
    if (error instanceof Prisma.PrismaClientInitializationError) {
      console.error('Prisma initialization error:', error.message);
      return new NextResponse('Database connection error', { status: 500 });
    }

    // Handle other Prisma errors
    if (error instanceof Prisma.PrismaClientUnknownRequestError) {
      console.error('Unknown Prisma error:', error.message);
    }
    
    return new NextResponse('Internal Error', { status: 500 });
  }
} 