import path from 'path';
import { fileURLToPath } from 'url';

const here = path.dirname(fileURLToPath(import.meta.url));

/**
 * Directory holding the Census 2011 `Rdir_2011_*.xls` files.
 * Override with DATASET_DIR=/path/to/dataset (or the first CLI argument);
 * default is backend/data/dataset, where the bundled zip extracts to.
 */
export const DATASET_DIR = path.resolve(
  process.argv[2] || process.env.DATASET_DIR || path.join(here, '..', '..', 'data', 'dataset')
);

export const BIHAR_FILE = path.join(DATASET_DIR, 'Rdir_2011_10_BIHAR.xls');
