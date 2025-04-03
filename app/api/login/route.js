import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    // Here you would typically validate against your database
    // This is just an example
    if (email === "test@example.com" && password === "password123") {
      // Generate a token (you should use a proper JWT library in production)
      const token = "example-token";

      return NextResponse.json({ 
        success: true, 
        token 
      });
    }

    return NextResponse.json(
      { success: false, message: 'Invalid credentials' },
      { status: 401 }
    );

  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
} 