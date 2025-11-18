/**
 * Supported file type constants
 */
export const FILE_TYPES = {
  PDF: 'pdf',
  DOCX: 'docx',
  TXT: 'txt',
  MD: 'md',
} as const;

export type FileTypeValue = typeof FILE_TYPES[keyof typeof FILE_TYPES];
