import path from 'path';
import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDirectory = path.resolve(__dirname, '../../meddiscover-data/data');

export async function readJson(fileName) {
  const filePath = path.join(dataDirectory, fileName);

  try {
    const raw = await readFile(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch (error) {
    const message = `Unable to load ${fileName} from meddiscover-data/data`;
    error.message = `${message}: ${error.message}`;
    throw error;
  }
}
