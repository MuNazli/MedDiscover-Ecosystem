const express = require('express');
const path = require('path');
const { readJson } = require('../utils/jsonReader');

const router = express.Router();
const clinicsFilePath = path.resolve(__dirname, '..', '..', 'meddiscover-data', 'data', 'clinics.json');

router.get('/', async (req, res) => {
  try {
    const clinics = await readJson(clinicsFilePath);
    res.json(clinics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
