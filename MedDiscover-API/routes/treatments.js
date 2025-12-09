const express = require('express');
const path = require('path');
const { readJson } = require('../utils/jsonReader');

const router = express.Router();
const treatmentsFilePath = path.resolve(__dirname, '..', '..', 'meddiscover-data', 'data', 'treatments.json');

router.get('/', async (req, res) => {
  try {
    const treatments = await readJson(treatmentsFilePath);
    res.json(treatments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
