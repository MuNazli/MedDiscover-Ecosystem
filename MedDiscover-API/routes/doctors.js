import { Router } from 'express';
import { readJson } from '../utils/jsonReader.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const doctors = await readJson('doctors.json');
    res.json(doctors);
  } catch (error) {
    next(error);
  }
});

export default router;
