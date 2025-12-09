import express from 'express';
import cors from 'cors';

import clinicsRouter from './routes/clinics.js';
import doctorsRouter from './routes/doctors.js';
import treatmentsRouter from './routes/treatments.js';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the MedDiscover API' });
});

app.use('/api/clinics', clinicsRouter);
app.use('/api/doctors', doctorsRouter);
app.use('/api/treatments', treatmentsRouter);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal Server Error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`MedDiscover API server listening on port ${PORT}`);
});
