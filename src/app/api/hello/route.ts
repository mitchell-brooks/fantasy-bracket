// ABOUTME: Simple health-check API route that returns a plain text greeting
// ABOUTME: Useful for verifying the API route handler is working
export async function GET(request: Request) {
  return new Response('Hello, Next.js!')
}
