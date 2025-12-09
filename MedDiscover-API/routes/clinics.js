import { Router } from 'express';
import { readJson } from '../utils/jsonReader.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const clinics = await readJson('clinics.json');
    res.json(clinics);
  } catch (error) {
    next(error);
  }
});

export default router;
