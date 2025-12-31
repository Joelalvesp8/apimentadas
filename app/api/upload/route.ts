import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { mkdirSync, existsSync } from 'fs';
import { getAuthenticatedUser } from '@/lib/utils/auth-helper';
import { isAdmin } from '@/lib/utils/admin-helper';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function errorResponse(error: string, status = 400) {
  return NextResponse.json({ error }, { status });
}

function successResponse(data: any, status = 200) {
  return NextResponse.json({ data }, { status });
}

function unauthorizedResponse() {
  return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
}

// POST /api/upload - Upload image (admin only)
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    // Check if user has email
    if (!user.email) {
      return errorResponse('Usuário sem email cadastrado', 400);
    }

    // Check if user is admin
    if (!isAdmin({ email: user.email })) {
      return errorResponse('Apenas administradores podem fazer upload de imagens', 403);
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    console.log('Upload request received from:', user.email);
    console.log('File received:', file?.name, 'Type:', file?.type, 'Size:', file?.size);

    if (!file) {
      console.error('No file in request');
      return errorResponse('Nenhum arquivo enviado');
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      console.error('Invalid file type:', file.type);
      return errorResponse('Tipo de arquivo inválido. Apenas imagens são permitidas (JPEG, PNG, WebP, GIF)');
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      console.error('File too large:', file.size);
      return errorResponse('Arquivo muito grande. Tamanho máximo: 5MB');
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = file.name.split('.').pop();
    const filename = `${timestamp}-${randomString}.${extension}`;

    console.log('Generated filename:', filename);

    // Ensure upload directory exists
    const publicDir = join(process.cwd(), 'public');
    const uploadsDir = join(publicDir, 'uploads');
    const productsDir = join(uploadsDir, 'products');

    console.log('Working directory:', process.cwd());
    console.log('Public directory:', publicDir);
    console.log('Uploads directory:', uploadsDir);
    console.log('Products directory:', productsDir);

    // Create directories synchronously to ensure they exist
    try {
      if (!existsSync(publicDir)) {
        console.log('Creating public directory...');
        mkdirSync(publicDir, { recursive: true });
      }
      if (!existsSync(uploadsDir)) {
        console.log('Creating uploads directory...');
        mkdirSync(uploadsDir, { recursive: true });
      }
      if (!existsSync(productsDir)) {
        console.log('Creating products directory...');
        mkdirSync(productsDir, { recursive: true });
      }
    } catch (dirError: any) {
      console.error('Error creating directories:', dirError);
      return errorResponse(`Erro ao criar diretório de upload: ${dirError.message}`, 500);
    }

    // Save file
    console.log('Converting file to buffer...');
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filepath = join(productsDir, filename);

    console.log('Writing file to:', filepath);
    await writeFile(filepath, buffer);
    console.log('File saved successfully');

    // Return public URL
    const url = `/uploads/products/${filename}`;
    console.log('Returning URL:', url);

    return successResponse({ url, filename }, 201);
  } catch (error: any) {
    console.error('Error uploading file:', error);
    console.error('Error stack:', error.stack);
    return errorResponse(`Erro ao fazer upload do arquivo: ${error.message}`, 500);
  }
}
