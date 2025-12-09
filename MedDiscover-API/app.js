const express = require('express');
const clinicsRouter = require('./routes/clinics');
const doctorsRouter = require('./routes/doctors');
const treatmentsRouter = require('./routes/treatments');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());

app.use('/api/clinics', clinicsRouter);
app.use('/api/doctors', doctorsRouter);
app.use('/api/treatments', treatmentsRouter);

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to MedDiscover API' });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`MedDiscover API listening on port ${PORT}`);
});
