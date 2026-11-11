import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || "http://localhost:3001";
const ALLOWED_ORIGIN =
  process.env.NEXT_PUBLIC_APP_URL ||
  process.env.BETTER_AUTH_URL ||
  "http://localhost:3000";

function corsHeaders(origin: string) {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Credentials": "true",
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const pathSegments = (await params).path;
  return proxy(request, pathSegments);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const pathSegments = (await params).path;
  return proxy(request, pathSegments);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const pathSegments = (await params).path;
  return proxy(request, pathSegments);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const pathSegments = (await params).path;
  return proxy(request, pathSegments);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const pathSegments = (await params).path;
  return proxy(request, pathSegments);
}

export async function OPTIONS(
  _request: NextRequest,
  { params: _params }: { params: Promise<{ path: string[] }> },
) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      ...corsHeaders(ALLOWED_ORIGIN),
      "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, x-csrf-token, Authorization",
      "Access-Control-Max-Age": "86400",
    },
  });
}

async function proxy(request: NextRequest, pathSegments: string[]) {
  const path = pathSegments.join("/");
  const targetUrl = `${API_URL}/${path}`;

  const headers: Record<string, string> = {};
  const cookie = request.headers.get("cookie");
  if (cookie) headers["cookie"] = cookie;
  const csrfToken = request.headers.get("x-csrf-token");
  if (csrfToken) headers["x-csrf-token"] = csrfToken;
  const contentType = request.headers.get("content-type");
  if (contentType) headers["content-type"] = contentType;
  headers["Access-Control-Allow-Origin"] = ALLOWED_ORIGIN;
  headers["Access-Control-Allow-Credentials"] = "true";

  const body = request.body ? await request.arrayBuffer() : null;

  const response = await fetch(targetUrl, {
    method: request.method,
    headers,
    body: body ? new Uint8Array(body) : undefined,
  });

  const responseHeaders: Record<string, string> = {};
  response.headers.forEach((value, key) => {
    if (key.toLowerCase() !== "connection") {
      responseHeaders[key] = value;
    }
  });
  responseHeaders["Access-Control-Allow-Origin"] = ALLOWED_ORIGIN;
  responseHeaders["Access-Control-Allow-Credentials"] = "true";

  const responseBody = await response.arrayBuffer();

  return new NextResponse(responseBody, {
    status: response.status,
    statusText: response.statusText,
    headers: responseHeaders,
  });
}
