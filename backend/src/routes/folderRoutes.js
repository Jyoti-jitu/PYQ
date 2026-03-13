const express = require('express');
const { createFolder, getFolders, savePaperToFolder, getPapersInFolder } = require('../controllers/folderController');

const router = express.Router();

// Route to create a new folder
router.post('/create', createFolder);

// Route to get all folders for a specific user
router.get('/:userId', getFolders);

// Route to save a paper to a specific folder
router.post('/save-paper', savePaperToFolder);

// Route to get all papers in a specific folder
router.get('/:folderId/papers', getPapersInFolder);

module.exports = router;
