// app/api/extract-document/route.js
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import os from 'os';
import mammoth from 'mammoth';

// When using App Router, we need to explicitly disable bodyParser in a different way
export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    // Create a temporary directory to store the uploaded file
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'document-'));

    // Get form data from the request
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Get the file content as buffer
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    // Create a temporary file path
    const filePath = path.join(tempDir, file.name);

    // Write the file to disk
    fs.writeFileSync(filePath, fileBuffer);

    let text = '';

    // Get mimetype
    const fileType = file.type;

    // Extract text based on file type
    if (
      fileType ===
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      fileType === 'application/msword'
    ) {
      // For DOCX files
      const result = await mammoth.extractRawText({ path: filePath });
      text = result.value;
    } else if (fileType === 'text/plain') {
      // For plain text files
      text = fs.readFileSync(filePath, 'utf8');
    } else {
      // For other file types - you might want to handle these differently
      text = fs.readFileSync(filePath, 'utf8');
    }

    // Clean up the temporary file
    try {
      fs.unlinkSync(filePath);
      fs.rmdirSync(tempDir);
    } catch (cleanupError) {
      console.error('Cleanup error:', cleanupError);
    }

    return NextResponse.json({ text });
  } catch (error) {
    console.error('Error extracting document:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to extract document' },
      { status: 500 }
    );
  }
}
