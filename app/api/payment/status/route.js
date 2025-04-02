export const dynamic = 'force-static';

export async function GET(request) {
  // Mock data return
  return new Response(JSON.stringify({ status: 'success' }), {
    headers: { 'Content-Type': 'application/json' },
  });
} 