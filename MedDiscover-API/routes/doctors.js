const express = require('express');
const path = require('path');
const { readJson } = require('../utils/jsonReader');

const router = express.Router();
const doctorsFilePath = path.resolve(__dirname, '..', '..', 'meddiscover-data', 'data', 'doctors.json');

router.get('/', async (req, res) => {
  try {
    const doctors = await readJson(doctorsFilePath);
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
