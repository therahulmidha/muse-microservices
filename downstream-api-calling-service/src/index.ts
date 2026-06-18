import { config } from 'dotenv';
config();
import express from 'express';

const app = express();
app.use(express.json())

const DELAY = 16;
const DOWNSTREAM_URL = `https://reqres.in/api/users?delay=${DELAY}`
app.use('/users', async (req, res, next) => {
  try {
    const response = await fetch(DOWNSTREAM_URL, {
      headers: {
        'x-api-key': process.env.REQRES_API_KEY!
      }
    });
    const json = await response.json();
    res.json({
      data: json,
      msg: 'Fetched Successfully'
    });
  } catch (error) {
    res.json({
      msg: 'Unable to fetch',
      error: true,
    })
  }

});
const PORT = 3006;

app.listen(PORT, () => {
  console.log(`Downstream API Calling Service running on port ${PORT}`);
});