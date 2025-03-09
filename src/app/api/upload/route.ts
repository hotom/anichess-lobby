import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/auth";
import { supabase } from "@/libs/supabase";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    console.log('Upload request from session:', session?.user);

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

    console.log('Processing file:', {
      name: file.name,
      type: file.type,
      size: file.size
    });

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename
    const timestamp = Date.now();
    const randomNum = Math.floor(Math.random() * 1E9);
    const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    const filename = `${session.user.username}-${timestamp}_${randomNum}${fileExtension}`;

    console.log('Uploading to Supabase:', filename);

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('uploads')
      .upload(filename, buffer, {
        contentType: file.type,
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

    console.log('Public URL:', publicUrl);

    return NextResponse.json({ url: publicUrl });
  } catch (error) {
    console.error('Error in upload handler:', error);
    return NextResponse.json({ 
      error: "Internal server error",
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 