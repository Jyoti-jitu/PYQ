const supabase = require('../config/supabase');

// Upload a PYQ file and save its metadata
const uploadPyq = async (req, res) => {
    try {
        const { title, branch, year, resourceType, facultyName, tags, userId, folderId } = req.body;
        const file = req.file;

        if (!file) {
            return res.status(400).json({ error: 'Please upload a PDF or image file' });
        }
        if (!title || !branch || !year || !resourceType) {
            return res.status(400).json({ error: 'Please provide all required fields' });
        }

        // Parse tags if it's sent as a stringified JSON array
        let parsedTags = [];
        if (tags) {
            try {
                parsedTags = JSON.parse(tags);
            } catch (e) {
                // fallback if somebody just sends a comma separated string
                parsedTags = tags.split(',').map(tag => tag.trim());
            }
        }

        // Add additional details as tags for better searchability
        // Split title and faculty name by spaces to add individual words as tags
        const titleWords = title ? title.split(/\s+/).filter(w => w.trim() !== '') : [];
        const facultyWords = facultyName ? facultyName.split(/\s+/).filter(w => w.trim() !== '') : [];

        const detailsAsTags = [
            title, branch, year, resourceType, facultyName,
            ...titleWords, ...facultyWords
        ]
            .filter(tag => tag && tag.toString().trim() !== '')
            .map(tag => tag.toString().trim().toLowerCase()); // convert to lowercase for uniform search

        // Combine and remove duplicates
        parsedTags = [...new Set([...parsedTags.map(t => t.toLowerCase()), ...detailsAsTags])];

        // Generate a unique filename to prevent overwriting
        const fileExt = file.originalname.split('.').pop();
        const uniqueFileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
        const filePath = `uploads/${uniqueFileName}`;

        console.log('Uploading file to Supabase Storage...', filePath);

        // Upload file to Supabase Storage bucket
        const { data: storageData, error: storageError } = await supabase.storage
            .from('pyq_files')
            .upload(filePath, file.buffer, {
                contentType: file.mimetype,
                upsert: false
            });

        if (storageError) {
            console.error('Storage Upload Error:', storageError);
            require('fs').appendFileSync('last_error.log', `[Storage] ${JSON.stringify(storageError)}\n`);
            return res.status(500).json({ error: 'Failed to upload the file to storage' });
        }

        // Get the public URL for the newly uploaded file
        const { data: publicUrlData } = supabase.storage
            .from('pyq_files')
            .getPublicUrl(filePath);

        const fileUrl = publicUrlData.publicUrl;

        console.log('File uploaded successfully. URL:', fileUrl);

        // Save the metadata in the SQL pyqs table
        const { data: dbData, error: dbError } = await supabase
            .from('pyqs')
            .insert([
                {
                    title: title,
                    branch: branch,
                    year: year,
                    resource_type: resourceType,
                    faculty_name: facultyName || null,
                    tags: parsedTags,
                    file_url: fileUrl,
                    uploaded_by: userId || null // Allow null if user is not passed
                }
            ])
            .select()
            .single();

        if (dbError) {
            console.error('Database Insertion Error:', dbError);
            require('fs').appendFileSync('last_error.log', `[DB] ${JSON.stringify(dbError)}\n`);
            return res.status(500).json({ error: 'Failed to save PYQ details to the database' });
        }

        // If a folderId is provided, also save this paper to that folder
        if (folderId && dbData?.id) {
            const { error: saveFolderError } = await supabase
                .from('saved_papers')
                .insert([
                    { folder_id: folderId, pyq_id: dbData.id }
                ]);

            if (saveFolderError) {
                console.error('Save to Folder Error:', saveFolderError);
                // We've already uploaded the file and saved the pyq, so just log the warning
            }
        }

        res.status(201).json({
            message: 'PYQ uploaded successfully!',
            pyq: dbData
        });

    } catch (error) {
        console.error('Unexpected error during PYQ upload:', error);
        require('fs').appendFileSync('last_error.log', `[Exception] ${error}\n`);
        res.status(500).json({ error: 'An internal server error occurred' });
    }
};

// Fetch all uploaded PYQs
const getPyqs = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('pyqs')
            .select(`
                *,
                students!uploaded_by(
                    full_name,
                    roll_number,
                    branch
                )
            `)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching PYQs:', error);
            return res.status(500).json({ error: 'Failed to fetch PYQs from the database' });
        }

        res.status(200).json({
            message: 'PYQs retrieved successfully',
            pyqs: data
        });

    } catch (error) {
        console.error('Unexpected error during GET PYQs:', error);
        res.status(500).json({ error: 'An internal server error occurred' });
    }
};

// Log a view when a user opens or downloads a PYQ
const logView = async (req, res) => {
    try {
        const { userId, pyqId } = req.body;

        if (!userId || !pyqId) {
            return res.status(400).json({ error: 'User ID and PYQ ID are required' });
        }

        // Upsert the view record. If it already exists, update viewed_at.
        const { error } = await supabase
            .from('recently_viewed')
            .upsert(
                {
                    user_id: userId,
                    pyq_id: pyqId,
                    viewed_at: new Date().toISOString()
                },
                {
                    onConflict: 'user_id, pyq_id'
                }
            );

        if (error) {
            console.error('Error logging view:', error);
            return res.status(500).json({ error: 'Failed to log view' });
        }

        res.status(200).json({ message: 'View logged successfully' });

    } catch (error) {
        console.error('Unexpected error during log view:', error);
        res.status(500).json({ error: 'An internal server error occurred' });
    }
};

// Fetch recently viewed PYQs for a user
const getRecentlyViewed = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        // Fetch recent views joining with pyqs and students (uploaded_by)
        const { data, error } = await supabase
            .from('recently_viewed')
            .select(`
                viewed_at,
                pyqs (
                    *,
                    students!uploaded_by (
                        full_name,
                        roll_number,
                        branch
                    )
                )
            `)
            .eq('user_id', userId)
            .order('viewed_at', { ascending: false })
            .limit(10); // Limit to top 10 recent views

        if (error) {
            console.error('Error fetching recently viewed:', error);
            return res.status(500).json({ error: 'Failed to fetch recently viewed PYQs' });
        }

        // Map the data to lift the pyqs properties up, keeping the structure similar to getPyqs
        const formattedPyqs = data.map(item => ({
            ...item.pyqs,
            viewed_at: item.viewed_at
        })).filter(item => item.id); // Filter out any null pyqs if they were deleted

        res.status(200).json({
            message: 'Recently viewed PYQs retrieved successfully',
            pyqs: formattedPyqs
        });

    } catch (error) {
        console.error('Unexpected error during GET recently viewed:', error);
        res.status(500).json({ error: 'An internal server error occurred' });
    }
};

// Fetch PYQs uploaded by a specific user
const getUserUploads = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        const { data, error } = await supabase
            .from('pyqs')
            .select(`
                *,
                students!uploaded_by(
                    full_name,
                    roll_number,
                    branch
                )
            `)
            .eq('uploaded_by', userId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching user uploads:', error);
            return res.status(500).json({ error: 'Failed to fetch user uploads' });
        }

        res.status(200).json({
            message: 'User uploads retrieved successfully',
            pyqs: data
        });

    } catch (error) {
        console.error('Unexpected error during GET user uploads:', error);
        res.status(500).json({ error: 'An internal server error occurred' });
    }
};

// Delete a PYQ by its ID
const deletePyq = async (req, res) => {
    try {
        const { pyqId } = req.params;
        const { userId } = req.body; // To verify ownership

        if (!pyqId || !userId) {
            return res.status(400).json({ error: 'PYQ ID and User ID are required' });
        }

        // 1. Verify ownership and get the file URL so we can delete it from storage
        const { data: pyqToVerify, error: fetchError } = await supabase
            .from('pyqs')
            .select('uploaded_by, file_url')
            .eq('id', pyqId)
            .single();

        if (fetchError || !pyqToVerify) {
            return res.status(404).json({ error: 'PYQ not found' });
        }

        if (pyqToVerify.uploaded_by !== userId) {
            return res.status(403).json({ error: 'You do not have permission to delete this file' });
        }

        // 2. Delete the record from the database (foreign key constraints should cascade or handle dependent records)
        const { error: deleteDbError } = await supabase
            .from('pyqs')
            .delete()
            .eq('id', pyqId);

        if (deleteDbError) {
            console.error('Error deleting PYQ from DB:', deleteDbError);
            return res.status(500).json({ error: 'Failed to delete PYQ record from database' });
        }

        // 3. Delete the file from Supabase Storage
        // Extract the file path from the file_url 
        // e.g., https://.../storage/v1/object/public/pyq_files/uploads/123-abc.pdf -> uploads/123-abc.pdf
        try {
            const urlObj = new URL(pyqToVerify.file_url);
            const pathSegments = urlObj.pathname.split('/');
            // Find the index of our bucket name
            const bucketIndex = pathSegments.indexOf('pyq_files');
            if (bucketIndex !== -1 && bucketIndex < pathSegments.length - 1) {
                const storagePath = pathSegments.slice(bucketIndex + 1).join('/');

                const { error: storageError } = await supabase.storage
                    .from('pyq_files')
                    .remove([storagePath]);

                if (storageError) {
                    console.error('Error removing file from storage (orphaned file):', storageError);
                    // We successfully deleted DB record, so we still return success, just log the storage issue
                }
            }
        } catch (storageUrlError) {
            console.error('Error parsing storage URL to delete file:', storageUrlError);
            // Non-fatal, proceed to success response
        }

        res.status(200).json({ message: 'PYQ deleted successfully' });

    } catch (error) {
        console.error('Unexpected error during PYQ deletion:', error);
        res.status(500).json({ error: 'An internal server error occurred' });
    }
};

module.exports = {
    uploadPyq,
    getPyqs,
    logView,
    getRecentlyViewed,
    getUserUploads,
    deletePyq
};
