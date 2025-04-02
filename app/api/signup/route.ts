import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // सर्वर चल रहा है या नहीं, यह चेक करें
    try {
      const response = await fetch('http://localhost:5000/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        // टाइमआउट सेट करें
        signal: AbortSignal.timeout(5000)
      });
      
      const data = await response.json();
      return NextResponse.json(data, { status: response.status });
    } catch (fetchError) {
      console.error('Fetch error:', fetchError);
      return NextResponse.json(
        { message: 'Could not connect to authentication server. Please make sure the server is running.' },
        { status: 503 }
      );
    }
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 