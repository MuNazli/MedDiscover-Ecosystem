import { Router } from 'express';
import { readJson } from '../utils/jsonReader.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const treatments = await readJson('treatments.json');
    res.json(treatments);
  } catch (error) {
    next(error);
  }
});

export default router;
