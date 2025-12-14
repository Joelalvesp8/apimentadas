import { NextResponse } from 'next/server';

export function successResponse(data: any, status: number = 200) {
  return NextResponse.json(
    {
      success: true,
      data,
    },
    { status }
  );
}

export function errorResponse(message: string, status: number = 500) {
  return NextResponse.json(
    {
      success: false,
      error: message,
    },
    { status }
  );
}

export function validationErrorResponse(errors: Record<string, string[]>) {
  return NextResponse.json(
    {
      success: false,
      error: 'Validation failed',
      errors,
    },
    { status: 400 }
  );
}

export function unauthorizedResponse(message: string = 'Unauthorized') {
  return errorResponse(message, 401);
}

export function notFoundResponse(message: string = 'Not found') {
  return errorResponse(message, 404);
}
