const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Routes
const authRoutes = require('./routes/authRoutes');
const pyqRoutes = require('./routes/pyqRoutes');
const folderRoutes = require('./routes/folderRoutes');
const uploadFolderRoutes = require('./routes/uploadFolderRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/pyq', pyqRoutes);
app.use('/api/folders', folderRoutes);           // Bookmark / Saved Papers folders
app.use('/api/upload-folders', uploadFolderRoutes); // My Uploads folders (separate)

app.get('/', (req, res) => {
  res.send('Backend API is running');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
