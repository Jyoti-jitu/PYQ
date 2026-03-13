const supabase = require('../config/supabase');

// Create a new folder for a user
const createFolder = async (req, res) => {
    try {
        const { studentId, folderName } = req.body;

        if (!studentId || !folderName) {
            return res.status(400).json({ error: 'Student ID and Folder Name are required' });
        }

        const { data, error } = await supabase
            .from('saved_folders')
            .insert([{ student_id: studentId, folder_name: folderName }])
            .select()
            .single();

        if (error) {
            console.error('Database Insertion Error:', error);
            return res.status(500).json({ error: 'Failed to create folder' });
        }

        res.status(201).json({
            message: 'Folder created successfully!',
            folder: data
        });

    } catch (error) {
        console.error('Unexpected error during folder creation:', error);
        res.status(500).json({ error: 'An internal server error occurred' });
    }
};

// Fetch all folders for a specific user
const getFolders = async (req, res) => {
    try {
        const { userId } = req.params;

        const { data, error } = await supabase
            .from('saved_folders')
            .select('*')
            .eq('student_id', userId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching folders:', error);
            return res.status(500).json({ error: 'Failed to fetch folders' });
        }

        res.status(200).json({
            message: 'Folders retrieved successfully',
            folders: data
        });

    } catch (error) {
        console.error('Unexpected error during gets folders:', error);
        res.status(500).json({ error: 'An internal server error occurred' });
    }
};

// Save a PYQ to a specific folder
const savePaperToFolder = async (req, res) => {
    try {
        const { folderId, pyqId } = req.body;

        if (!folderId || !pyqId) {
            return res.status(400).json({ error: 'Folder ID and PYQ ID are required' });
        }

        // Optional: Check if the paper is already saved in that folder to prevent duplicates
        const { data: existingData, error: existingError } = await supabase
            .from('saved_papers')
            .select('id')
            .eq('folder_id', folderId)
            .eq('pyq_id', pyqId)
            .single();

        if (existingData) {
            return res.status(400).json({ error: 'Paper already saved in this folder' });
        }

        const { data, error } = await supabase
            .from('saved_papers')
            .insert([{ folder_id: folderId, pyq_id: pyqId }])
            .select()
            .single();

        if (error) {
            console.error('Database Insertion Error:', error);
            return res.status(500).json({ error: 'Failed to save paper to folder' });
        }

        res.status(201).json({
            message: 'Paper saved to folder successfully!',
            savedPaper: data
        });

    } catch (error) {
        console.error('Unexpected error during save paper:', error);
        res.status(500).json({ error: 'An internal server error occurred' });
    }
};

// Fetch all papers within a specific folder
const getPapersInFolder = async (req, res) => {
    try {
        const { folderId } = req.params;

        const { data, error } = await supabase
            .from('saved_papers')
            .select(`
                id,
                saved_at,
                pyqs (*)
            `)
            .eq('folder_id', folderId)
            .order('saved_at', { ascending: false });

        if (error) {
            console.error('Error fetching saved papers:', error);
            return res.status(500).json({ error: 'Failed to fetch saved papers' });
        }

        res.status(200).json({
            message: 'Papers retrieved successfully',
            papers: data
        });

    } catch (error) {
        console.error('Unexpected error during gets saved papers:', error);
        res.status(500).json({ error: 'An internal server error occurred' });
    }
};

module.exports = {
    createFolder,
    getFolders,
    savePaperToFolder,
    getPapersInFolder
};
