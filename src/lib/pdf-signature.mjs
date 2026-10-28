const PDF_HEADER = [0x25, 0x50, 0x44, 0x46, 0x2d]; // %PDF-
const MAX_HEADER_OFFSET = 1024 - PDF_HEADER.length;

/**
 * Check the PDF signature before accepting an uploaded file.
 * The PDF specification permits readers to find the header within the first
 * 1024 bytes, so support that compatibility window but reject arbitrary files.
 */
export function hasPdfHeader(value) {
  if (!(value instanceof Uint8Array) || value.byteLength < PDF_HEADER.length) {
    return false;
  }

  const lastStart = Math.min(value.byteLength - PDF_HEADER.length, MAX_HEADER_OFFSET);
  for (let offset = 0; offset <= lastStart; offset += 1) {
    if (PDF_HEADER.every((byte, index) => value[offset + index] === byte)) {
      return true;
    }
  }

  return false;
}
