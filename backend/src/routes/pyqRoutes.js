const express = require('express');
const multer = require('multer');
const { uploadPyq, getPyqs, logView, getRecentlyViewed, getUserUploads, deletePyq } = require('../controllers/pyqController');

const router = express.Router();

// Configure multer to use memory storage (so we can pass the buffer directly to Supabase)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Routes
router.post('/upload', upload.single('file'), uploadPyq);
router.post('/view', logView);
router.get('/recent/:userId', getRecentlyViewed);
router.get('/user/:userId', getUserUploads);
router.get('/', getPyqs);
router.delete('/:pyqId', deletePyq);

module.exports = router;
