import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { registerSchema } from '@/lib/validations/auth';
import { errorResponse, successResponse, validationErrorResponse } from '@/lib/utils/responses';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validation = registerSchema.safeParse(body);
    if (!validation.success) {
      const errors: Record<string, string[]> = {};
      validation.error.errors.forEach((err) => {
        const path = err.path[0] as string;
        if (!errors[path]) {
          errors[path] = [];
        }
        errors[path].push(err.message);
      });
      return validationErrorResponse(errors);
    }

    const { email, password, name } = validation.data;
    const normalizedEmail = email.toLowerCase();

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return errorResponse('Usuário já existe com este email', 400);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user (auto-approved - users can play immediately after registration)
    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        name,
        password: hashedPassword,
        provider: 'credentials',
        approved: true, // Auto-approve all new users
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });

    return successResponse(
      {
        user,
        message: 'Usuário criado com sucesso',
      },
      201
    );
  } catch (error: any) {
    console.error('Error in register:', error);
    const errorMessage = error?.message || 'Erro ao criar usuário';
    return errorResponse(errorMessage);
  }
}
