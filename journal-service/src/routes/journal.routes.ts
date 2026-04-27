import express from 'express';
import { create, getAll } from '../controllers/journal.controller';

const router = express.Router();

// router.get('/', (req, res) => {
//     res.send('Journal Service Running');
// });
router.post('/create', create);
router.get('/', getAll);
export default router;