import { NextResponse } from "next/server";
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/auth";
import { existsSync } from 'fs';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.username) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: "File must be an image" }, { status: 400 });
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File size must be less than 5MB" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create unique filename with timestamp and random number
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    const extension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    const filename = `${session.user.username}-${uniqueSuffix}${extension}`;
    
    // Ensure uploads directory exists
    const uploadDir = join(process.cwd(), 'public', 'uploads');
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }
    
    const filepath = join(uploadDir, filename);
    
    try {
      await writeFile(filepath, buffer);
      console.log('File saved successfully:', filepath);
      
      return NextResponse.json({ 
        url: `/uploads/${filename}`
      });
    } catch (writeError) {
      console.error('Error writing file:', writeError);
      return NextResponse.json({ error: "Failed to save file" }, { status: 500 });
    }
  } catch (error) {
    console.error('Error handling upload:', error);
    return NextResponse.json({ error: "Error uploading file" }, { status: 500 });
  }
} 