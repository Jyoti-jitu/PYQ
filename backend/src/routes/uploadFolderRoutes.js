const express = require('express');
const {
    createUploadFolder,
    getUploadFolders,
    addPaperToUploadFolder,
    removePaperFromUploadFolder,
    getPapersInUploadFolder,
    deleteUploadFolder,
} = require('../controllers/uploadFolderController');

const router = express.Router();

// Create a new upload folder
router.post('/create', createUploadFolder);

// Get all upload folders for a user
router.get('/user/:userId', getUploadFolders);

// Add a paper to an upload folder
router.post('/add-paper', addPaperToUploadFolder);

// Remove a paper from an upload folder
router.delete('/remove-paper', removePaperFromUploadFolder);

// Get all papers in a specific upload folder
router.get('/:folderId/papers', getPapersInUploadFolder);

// Delete an upload folder
router.delete('/:folderId', deleteUploadFolder);

module.exports = router;
