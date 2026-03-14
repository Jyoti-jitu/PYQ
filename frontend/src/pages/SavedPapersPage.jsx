import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
    BookOpen, FileText, Bookmark, Clock, Upload, LogOut, UserCircle,
    ChevronRight, Folder, FolderPlus, File as FileIcon, Download, Search, X, Menu
} from 'lucide-react';

const SavedPapersPage = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [folders, setFolders] = useState([]);
    const [selectedFolder, setSelectedFolder] = useState(null);
    const [papers, setPapers] = useState([]);
    const [loading, setLoading] = useState(true);

    const [isCreatingFolder, setIsCreatingFolder] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');

    // --- Mobile Menu State ---
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // PDF Viewer State
    const [viewingPdfUrl, setViewingPdfUrl] = useState(null);

    useEffect(() => {
        const loggedInUser = localStorage.getItem('user');
        if (loggedInUser) {
            const parsedUser = JSON.parse(loggedInUser);
            setUser(parsedUser);
            fetchFolders(parsedUser.id);
        } else {
            navigate('/login');
        }
    }, [navigate]);

    const fetchFolders = async (userId) => {
        setLoading(true);
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/folders/${userId}`);
            setFolders(res.data.folders || []);
        } catch (error) {
            console.error('Error fetching folders:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchPapersInFolder = async (folderId) => {
        setLoading(true);
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/folders/${folderId}/papers`);
            setPapers(res.data.papers || []);
        } catch (error) {
            console.error('Error fetching papers in folder:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateFolder = async (e) => {
        e.preventDefault();
        if (!newFolderName.trim() || !user) return;

        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/folders/create`, {
                studentId: user.id,
                folderName: newFolderName.trim()
            });
            setFolders([res.data.folder, ...folders]);
            setNewFolderName('');
            setIsCreatingFolder(false);
        } catch (error) {
            console.error('Error creating folder:', error);
            alert('Failed to create folder');
        }
    };

    const handleFolderClick = (folder) => {
        setSelectedFolder(folder);
        fetchPapersInFolder(folder.id);
    };

    const handleBackToFolders = () => {
        setSelectedFolder(null);
        setPapers([]);
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/login');
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-portalBgLight flex font-sans">
            {/* Mobile Sidebar Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-gray-900/50 z-40 md:hidden backdrop-blur-sm transition-opacity"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar Navigation */}
            <aside className={`w-64 bg-white border-r border-gray-200 flex-col shadow-sm z-50 fixed md:static inset-y-0 left-0 transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 flex`}>
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center space-x-3 cursor-pointer" onClick={() => { navigate('/dashboard'); setIsMobileMenuOpen(false); }}>
                        <div className="w-10 h-10 bg-portalBlue rounded-lg flex items-center justify-center text-white shadow-md">
                            <BookOpen size={20} />
                        </div>
                        <h2 className="text-xl font-bold text-portalBlue tracking-tight uppercase">GITA PYQ</h2>
                    </div>
                    <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden text-gray-500 hover:text-gray-700">
                        <X size={24} />
                    </button>
                </div>

                <nav className="flex-1 p-4 flex flex-col gap-2">
                    <button onClick={() => { navigate('/dashboard'); setIsMobileMenuOpen(false); }} className="flex items-center space-x-3 px-4 py-3 text-gray-600 hover:bg-gray-50 hover:text-portalBlue rounded-lg font-medium transition-colors w-full text-left">
                        <FileText size={20} />
                        <span>All Papers</span>
                    </button>
                    <button onClick={() => { navigate('/search'); setIsMobileMenuOpen(false); }} className="flex items-center space-x-3 px-4 py-3 text-gray-600 hover:bg-gray-50 hover:text-portalBlue rounded-lg font-medium transition-colors w-full text-left">
                        <Search size={20} />
                        <span>Search Papers</span>
                    </button>
                    <button onClick={() => setIsMobileMenuOpen(false)} className="flex items-center space-x-3 px-4 py-3 bg-blue-50 text-portalBlue rounded-lg font-medium transition-colors w-full text-left">
                        <Bookmark size={20} />
                        <span>Saved Papers</span>
                    </button>
                    <button onClick={() => { navigate('/recently-viewed'); setIsMobileMenuOpen(false); }} className="flex items-center space-x-3 px-4 py-3 text-gray-600 hover:bg-gray-50 hover:text-portalBlue rounded-lg font-medium transition-colors w-full text-left">
                        <Clock size={20} />
                        <span>Recently Viewed</span>
                    </button>
                    <button onClick={() => { navigate('/my-uploads'); setIsMobileMenuOpen(false); }} className="flex items-center space-x-3 px-4 py-3 text-gray-600 hover:bg-gray-50 hover:text-portalBlue rounded-lg font-medium transition-colors w-full text-left">
                        <FileText size={20} />
                        <span>My Uploads</span>
                    </button>
                    <button onClick={() => { navigate('/upload'); setIsMobileMenuOpen(false); }} className="flex items-center space-x-3 px-4 py-3 text-gray-600 hover:bg-gray-50 hover:text-portalBlue rounded-lg font-medium transition-colors w-full text-left">
                        <Upload size={20} />
                        <span>Upload PYQ</span>
                    </button>
                </nav>

                <div className="p-4 border-t border-gray-100 hidden md:block">
                    <button
                        onClick={handleLogout}
                        className="flex items-center space-x-3 px-4 py-3 w-full text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors"
                    >
                        <LogOut size={20} />
                        <span>Log Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 relative w-full">
                {/* Decorative background blobs */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100 opacity-40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-orange-100 opacity-40 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3 pointer-events-none"></div>

                {/* Top Header */}
                <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 py-4 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-10 shadow-sm w-full">
                    <div className="flex items-center md:hidden space-x-3 w-full">
                        <button onClick={() => setIsMobileMenuOpen(true)} className="text-gray-600 hover:text-portalBlue p-1 mr-2">
                            <Menu size={24} />
                        </button>
                        <div className="flex-1">
                            <h2 className="text-lg font-bold text-portalBlue tracking-tight truncate">GITA PYQ</h2>
                        </div>
                    </div>

                    <div className="hidden md:flex items-center space-x-3 text-sm font-medium text-gray-500 whitespace-nowrap">
                        <button onClick={() => navigate('/dashboard')} className="hover:text-portalBlue transition-colors">Dashboard</button>
                        <ChevronRight size={14} />
                        <span className={!selectedFolder ? "text-gray-900" : "hover:text-portalBlue transition-colors cursor-pointer"} onClick={handleBackToFolders}>Saved Papers</span>
                        {selectedFolder && (
                            <>
                                <ChevronRight size={14} />
                                <span className="text-gray-900">{selectedFolder.folder_name}</span>
                            </>
                        )}
                    </div>

                    {/* Global Navbar Search */}
                    <div className="hidden md:flex flex-1 max-w-md mx-6 lg:mx-12 relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search size={18} className="text-gray-400" />
                        </div>
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                const q = e.target.search.value;
                                if (q.trim()) navigate(`/search?q=${encodeURIComponent(q.trim())}`);
                            }}
                            className="w-full"
                        >
                            <input
                                name="search"
                                type="text"
                                placeholder="Search all PYQs..."
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-portalBlue/20 focus:border-portalBlue transition-all text-gray-900"
                            />
                        </form>
                    </div>

                    <div className="flex items-center space-x-4">
                        <button onClick={() => navigate('/profile')} className="text-gray-400 hover:text-portalBlue transition-colors group relative">
                            <UserCircle size={28} />
                        </button>
                    </div>
                </header>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-auto p-6 sm:p-8 relative z-10">
                    <div className="max-w-6xl mx-auto space-y-8">

                        <div className="flex justify-between items-end">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                    {selectedFolder ? selectedFolder.folder_name : 'My Saved Folders'}
                                </h1>
                                <p className="text-gray-500 text-sm">
                                    {selectedFolder ? 'Papers saved to this collection' : 'Organize your study materials'}
                                </p>
                            </div>

                            {!selectedFolder && !isCreatingFolder && (
                                <button
                                    onClick={() => setIsCreatingFolder(true)}
                                    className="flex items-center px-5 py-2.5 bg-portalBlue text-white rounded-xl hover:bg-blue-800 transition-colors shadow-md text-sm font-bold"
                                >
                                    <FolderPlus size={18} className="mr-2" />
                                    New Folder
                                </button>
                            )}

                            {selectedFolder && (
                                <div className="flex items-center space-x-3">
                                    <button
                                        onClick={() => navigate(`/upload?folderId=${selectedFolder.id}&folderName=${encodeURIComponent(selectedFolder.folder_name)}`)}
                                        className="flex items-center px-5 py-2.5 bg-portalBlue text-white rounded-xl hover:bg-blue-800 transition-colors shadow-md text-sm font-bold"
                                    >
                                        <Upload size={18} className="mr-2" />
                                        Upload to Folder
                                    </button>
                                    <button
                                        onClick={handleBackToFolders}
                                        className="px-5 py-2.5 bg-white text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-sm text-sm font-bold"
                                    >
                                        Back to Folders
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Create Folder UI */}
                        {!selectedFolder && isCreatingFolder && (
                            <div className="bg-white/70 backdrop-blur-lg rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/80 p-6 animate-in fade-in slide-in-from-top-4 duration-300">
                                <form onSubmit={handleCreateFolder} className="flex flex-col sm:flex-row gap-4 items-end">
                                    <div className="flex-1 w-full">
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5 focus-within:text-portalBlue transition-colors">Folder Name</label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-portalBlue/50 focus:border-portalBlue focus:bg-white transition-all shadow-sm"
                                            placeholder="e.g. Midterm Prep, Graphics Notes..."
                                            value={newFolderName}
                                            onChange={(e) => setNewFolderName(e.target.value)}
                                            autoFocus
                                            required
                                        />
                                    </div>
                                    <div className="flex space-x-3 w-full sm:w-auto">
                                        <button
                                            type="button"
                                            onClick={() => setIsCreatingFolder(false)}
                                            className="flex-1 sm:flex-none px-6 py-3 text-sm font-bold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all shadow-sm"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="flex-1 sm:flex-none px-8 py-3 text-sm font-bold text-white bg-portalBlue rounded-xl hover:bg-blue-800 transition-all shadow-md active:scale-95"
                                        >
                                            Create
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* Folder Grid view */}
                        {!selectedFolder && (
                            loading ? (
                                <div className="text-center py-12 text-gray-500">Loading your folders...</div>
                            ) : folders.length === 0 ? (
                                <div className="text-center py-16 bg-white/50 rounded-3xl border border-dashed border-gray-300">
                                    <div className="w-16 h-16 bg-blue-50 text-portalBlue rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Folder size={32} />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900">No folders yet</h3>
                                    <p className="text-gray-500 mt-1 mb-6">Create a folder to start saving and organizing papers.</p>
                                    {!isCreatingFolder && (
                                        <button
                                            onClick={() => setIsCreatingFolder(true)}
                                            className="px-6 py-2.5 bg-portalBlue text-white rounded-lg hover:bg-blue-800 transition-colors shadow-sm text-sm font-bold"
                                        >
                                            Create First Folder
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {folders.map(folder => (
                                        <div
                                            key={folder.id}
                                            onClick={() => handleFolderClick(folder)}
                                            className="group bg-white rounded-3xl shadow-sm border border-gray-100 p-6 flex flex-col hover:shadow-lg hover:border-portalBlue/30 transition-all cursor-pointer transform hover:-translate-y-1"
                                        >
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="w-14 h-14 bg-gradient-to-br from-blue-50 to-blue-100 text-portalBlue rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                                                    <Folder fill="currentColor" size={26} className="text-portalBlue/20 absolute" />
                                                    <Folder size={26} className="relative z-10" />
                                                </div>
                                                <ChevronRight className="text-gray-300 group-hover:text-portalBlue transition-colors" />
                                            </div>
                                            <h3 className="text-lg font-bold text-gray-900 group-hover:text-portalBlue transition-colors line-clamp-1">{folder.folder_name}</h3>
                                            <p className="text-xs text-gray-400 mt-auto pt-4 flex items-center">
                                                <Clock size={12} className="mr-1" />
                                                Created {new Date(folder.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )
                        )}

                        {/* Papers List View within a Folder */}
                        {selectedFolder && (
                            <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
                                <div className="divide-y divide-gray-100">
                                    {loading ? (
                                        <div className="p-8 text-center text-gray-500">Loading saved papers...</div>
                                    ) : papers.length === 0 ? (
                                        <div className="p-16 text-center">
                                            <div className="w-16 h-16 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <FileIcon size={32} />
                                            </div>
                                            <h3 className="text-lg font-bold text-gray-900">This folder is empty</h3>
                                            <p className="text-gray-500 mt-1">Go to the Dashboard and click the Bookmark icon on a paper to save it here.</p>
                                            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
                                                <button
                                                    onClick={() => navigate(`/upload?folderId=${selectedFolder.id}&folderName=${encodeURIComponent(selectedFolder.folder_name)}`)}
                                                    className="px-6 py-2.5 bg-portalBlue text-white rounded-lg hover:bg-blue-800 transition-colors shadow-sm text-sm font-bold w-full sm:w-auto flex justify-center items-center"
                                                >
                                                    <Upload size={16} className="mr-2" />
                                                    Upload New File
                                                </button>
                                                <button
                                                    onClick={() => navigate('/dashboard')}
                                                    className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors shadow-sm text-sm font-bold w-full sm:w-auto"
                                                >
                                                    Browse Dashboard
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        papers.map((sp) => {
                                            const paper = sp.pyqs; // Extracted joined data
                                            if (!paper) return null;

                                            return (
                                                <div key={sp.id} className="p-6 hover:bg-gray-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 group">
                                                    <div className="flex items-start space-x-4">
                                                        <div className="p-3 bg-blue-50/50 text-portalBlue rounded-xl group-hover:bg-blue-100 transition-colors mt-1 sm:mt-0">
                                                            <FileIcon size={22} />
                                                        </div>
                                                        <div>
                                                            <h4 className="text-base font-bold text-gray-900 leading-tight group-hover:text-portalBlue transition-colors">{paper.title}</h4>
                                                            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs font-semibold text-gray-500">
                                                                <span className="bg-gray-100 px-2 py-1 rounded-md text-gray-700">{paper.branch}</span>
                                                                <span className="bg-blue-50 text-portalBlue px-2 py-1 rounded-md">{paper.resource_type}</span>
                                                                <span className="bg-orange-50 text-portalOrange px-2 py-1 rounded-md">{paper.year}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center space-x-2 sm:self-center ml-14 sm:ml-0">
                                                        <button
                                                            onClick={() => setViewingPdfUrl(paper.file_url)}
                                                            className="px-4 py-2 text-sm font-bold text-portalBlue bg-blue-50 hover:bg-portalBlue hover:text-white rounded-xl transition-all shadow-sm shadow-blue-100 flex items-center"
                                                        >
                                                            Open
                                                        </button>
                                                        <a
                                                            href={paper.file_url}
                                                            download
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="p-2 text-gray-400 hover:text-portalOrange bg-gray-50 hover:bg-orange-50 rounded-xl transition-colors"
                                                            title="Download"
                                                        >
                                                            <Download size={18} />
                                                        </a>
                                                    </div>
                                                </div>
                                            )
                                        })
                                    )}
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </main>

            {/* PDF Document Modal overlay Viewer */}
            {viewingPdfUrl && (
                <div className="fixed inset-0 z-[100] flex flex-col bg-gray-900/95 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="flex justify-between items-center py-3 px-6 bg-gray-900 text-white shadow-xl border-b border-gray-800">
                        <h3 className="text-lg font-bold flex items-center tracking-wide">
                            <FileText className="mr-3 text-portalBlue" size={20} />
                            Document Viewer
                        </h3>
                        <div className="flex items-center gap-4">
                            <a
                                href={viewingPdfUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-4 py-2 bg-portalBlue/20 text-blue-200 hover:bg-portalBlue hover:text-white rounded-lg text-sm font-bold transition-colors flex items-center"
                            >
                                Open in New Tab
                            </a>
                            <button onClick={() => setViewingPdfUrl(null)} className="p-2 text-gray-400 hover:bg-red-500 hover:text-white rounded-lg transition-all" title="Close Viewer">
                                <X size={24} />
                            </button>
                        </div>
                    </div>
                    <div className="flex-1 w-full bg-[#323639] p-0 sm:p-2 lg:p-4 shadow-inner">
                        <iframe
                            src={viewingPdfUrl}
                            className="w-full h-full rounded-none sm:rounded-xl shadow-2xl border-0 bg-white"
                            title="PDF Inline Viewer"
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default SavedPapersPage;
