const supabase = require('../config/supabase');

// Create a new upload folder for a user
const createUploadFolder = async (req, res) => {
    try {
        const { userId, folderName } = req.body;

        if (!userId || !folderName) {
            return res.status(400).json({ error: 'User ID and Folder Name are required' });
        }

        const { data, error } = await supabase
            .from('upload_folders')
            .insert([{ user_id: userId, folder_name: folderName }])
            .select()
            .single();

        if (error) {
            console.error('Error creating upload folder:', error);
            return res.status(500).json({ error: 'Failed to create folder' });
        }

        res.status(201).json({ message: 'Folder created successfully!', folder: data });
    } catch (error) {
        console.error('Unexpected error:', error);
        res.status(500).json({ error: 'An internal server error occurred' });
    }
};

// Fetch all upload folders for a specific user
const getUploadFolders = async (req, res) => {
    try {
        const { userId } = req.params;

        const { data, error } = await supabase
            .from('upload_folders')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching upload folders:', error);
            return res.status(500).json({ error: 'Failed to fetch folders' });
        }

        res.status(200).json({ message: 'Folders retrieved successfully', folders: data });
    } catch (error) {
        console.error('Unexpected error:', error);
        res.status(500).json({ error: 'An internal server error occurred' });
    }
};

// Add a PYQ to an upload folder
const addPaperToUploadFolder = async (req, res) => {
    try {
        const { folderId, pyqId } = req.body;

        if (!folderId || !pyqId) {
            return res.status(400).json({ error: 'Folder ID and PYQ ID are required' });
        }

        // Prevent duplicates
        const { data: existing } = await supabase
            .from('upload_folder_papers')
            .select('id')
            .eq('folder_id', folderId)
            .eq('pyq_id', pyqId)
            .single();

        if (existing) {
            return res.status(400).json({ error: 'Paper already in this folder' });
        }

        const { data, error } = await supabase
            .from('upload_folder_papers')
            .insert([{ folder_id: folderId, pyq_id: pyqId }])
            .select()
            .single();

        if (error) {
            console.error('Error adding paper to folder:', error);
            return res.status(500).json({ error: 'Failed to add paper to folder' });
        }

        res.status(201).json({ message: 'Paper added to folder successfully!', entry: data });
    } catch (error) {
        console.error('Unexpected error:', error);
        res.status(500).json({ error: 'An internal server error occurred' });
    }
};

// Remove a PYQ from an upload folder
const removePaperFromUploadFolder = async (req, res) => {
    try {
        const { folderId, pyqId } = req.body;

        if (!folderId || !pyqId) {
            return res.status(400).json({ error: 'Folder ID and PYQ ID are required' });
        }

        const { error } = await supabase
            .from('upload_folder_papers')
            .delete()
            .eq('folder_id', folderId)
            .eq('pyq_id', pyqId);

        if (error) {
            console.error('Error removing paper from folder:', error);
            return res.status(500).json({ error: 'Failed to remove paper from folder' });
        }

        res.status(200).json({ message: 'Paper removed from folder successfully!' });
    } catch (error) {
        console.error('Unexpected error:', error);
        res.status(500).json({ error: 'An internal server error occurred' });
    }
};

// Get all papers in a specific upload folder
const getPapersInUploadFolder = async (req, res) => {
    try {
        const { folderId } = req.params;

        const { data, error } = await supabase
            .from('upload_folder_papers')
            .select(`
                id,
                added_at,
                pyqs (*)
            `)
            .eq('folder_id', folderId)
            .order('added_at', { ascending: false });

        if (error) {
            console.error('Error fetching papers in folder:', error);
            return res.status(500).json({ error: 'Failed to fetch papers' });
        }

        res.status(200).json({
            message: 'Papers retrieved successfully',
            papers: data
        });
    } catch (error) {
        console.error('Unexpected error:', error);
        res.status(500).json({ error: 'An internal server error occurred' });
    }
};

// Delete an upload folder (and its paper associations)
const deleteUploadFolder = async (req, res) => {
    try {
        const { folderId } = req.params;

        // Remove all paper associations first
        await supabase
            .from('upload_folder_papers')
            .delete()
            .eq('folder_id', folderId);

        const { error } = await supabase
            .from('upload_folders')
            .delete()
            .eq('id', folderId);

        if (error) {
            console.error('Error deleting folder:', error);
            return res.status(500).json({ error: 'Failed to delete folder' });
        }

        res.status(200).json({ message: 'Folder deleted successfully!' });
    } catch (error) {
        console.error('Unexpected error:', error);
        res.status(500).json({ error: 'An internal server error occurred' });
    }
};

module.exports = {
    createUploadFolder,
    getUploadFolders,
    addPaperToUploadFolder,
    removePaperFromUploadFolder,
    getPapersInUploadFolder,
    deleteUploadFolder,
};
