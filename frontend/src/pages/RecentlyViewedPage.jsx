import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
    BookOpen, FileText, Bookmark, Clock, Upload, LogOut, UserCircle,
    ChevronRight, Download, X, FolderPlus, Search
} from 'lucide-react';

const RecentlyViewedPage = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [recentPapers, setRecentPapers] = useState([]);
    const [loadingPapers, setLoadingPapers] = useState(true);

    // Save Paper Modal States
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPaperToSave, setSelectedPaperToSave] = useState(null);
    const [folders, setFolders] = useState([]);
    const [loadingFolders, setLoadingFolders] = useState(false);
    const [saveMessage, setSaveMessage] = useState('');

    // PDF Viewer State
    const [viewingPdfUrl, setViewingPdfUrl] = useState(null);

    useEffect(() => {
        const loggedInUser = localStorage.getItem('user');
        if (loggedInUser) {
            const parsedUser = JSON.parse(loggedInUser);
            setUser(parsedUser);
            fetchRecentlyViewed(parsedUser.id);
        } else {
            navigate('/login');
        }
    }, [navigate]);

    const fetchRecentlyViewed = async (userId) => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/pyq/recent/${userId}`);
            setRecentPapers(res.data.pyqs || []);
        } catch (error) {
            console.error('Error fetching recently viewed PYQs:', error);
        } finally {
            setLoadingPapers(false);
        }
    };

    const handleLogView = async (pyqId) => {
        if (!user) return;
        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/pyq/view`, {
                userId: user.id,
                pyqId: pyqId
            });
            // Soft refresh to push to top
            fetchRecentlyViewed(user.id);
        } catch (error) {
            console.error('Error logging view:', error);
        }
    };

    const handleViewPaper = (paper) => {
        handleLogView(paper.id);
        setViewingPdfUrl(paper.file_url);
    };

    const handleDownloadPaper = (paper) => {
        handleLogView(paper.id);
    };

    const openSaveModal = async (paper) => {
        if (!user) {
            alert("Please login to save papers");
            return;
        }
        setSelectedPaperToSave(paper);
        setIsModalOpen(true);
        setSaveMessage('');
        setLoadingFolders(true);

        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/folders/${user.id}`);
            setFolders(res.data.folders || []);
        } catch (error) {
            console.error('Error fetching folders:', error);
            setSaveMessage('Failed to load folders');
        } finally {
            setLoadingFolders(false);
        }
    };

    const closeSaveModal = () => {
        setIsModalOpen(false);
        setSelectedPaperToSave(null);
        setSaveMessage('');
    };

    const handleSaveToFolder = async (folderId) => {
        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/folders/save`, {
                folderId,
                pyqId: selectedPaperToSave.id
            });
            setSaveMessage('Paper successfully saved!');
            setTimeout(closeSaveModal, 1500);
        } catch (error) {
            console.error('Error saving paper:', error);
            if (error.response?.status === 409) {
                setSaveMessage('Paper is already in this folder');
            } else {
                setSaveMessage('Failed to save paper');
            }
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/login');
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-portalBgLight flex font-sans">
            {/* Sidebar Navigation */}
            <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col shadow-sm z-10 w-full md:w-64 fixed h-full pb-16 md:relative md:pb-0 bottom-0">
                <div
                    className="p-6 border-b border-gray-100 flex items-center space-x-3 cursor-pointer"
                    onClick={() => navigate('/dashboard')}
                >
                    <div className="w-10 h-10 bg-portalBlue rounded-lg flex items-center justify-center text-white shadow-md">
                        <BookOpen size={20} />
                    </div>
                    <h2 className="text-xl font-bold text-portalBlue tracking-tight uppercase">GITA PYQ</h2>
                </div>

                <nav className="flex-1 p-4 flex flex-col gap-2">
                    <button onClick={() => navigate('/dashboard')} className="flex items-center space-x-3 px-4 py-3 text-gray-600 hover:bg-gray-50 hover:text-portalBlue rounded-lg font-medium transition-colors w-full text-left">
                        <FileText size={20} />
                        <span>All Papers</span>
                    </button>
                    <button onClick={() => navigate('/search')} className="flex items-center space-x-3 px-4 py-3 text-gray-600 hover:bg-gray-50 hover:text-portalBlue rounded-lg font-medium transition-colors w-full text-left">
                        <Search size={20} />
                        <span>Search Papers</span>
                    </button>
                    <button onClick={() => navigate('/saved-papers')} className="flex items-center space-x-3 px-4 py-3 text-gray-600 hover:bg-gray-50 hover:text-portalBlue rounded-lg font-medium transition-colors w-full text-left">
                        <Bookmark size={20} />
                        <span>Saved Papers</span>
                    </button>
                    <button onClick={() => navigate('/recently-viewed')} className="flex items-center space-x-3 px-4 py-3 bg-blue-50 text-portalBlue rounded-lg font-medium transition-colors w-full text-left">
                        <Clock size={20} />
                        <span>Recently Viewed</span>
                    </button>
                    <button onClick={() => navigate('/my-uploads')} className="flex items-center space-x-3 px-4 py-3 text-gray-600 hover:bg-gray-50 hover:text-portalBlue rounded-lg font-medium transition-colors w-full text-left">
                        <FileText size={20} />
                        <span>My Uploads</span>
                    </button>
                    <button
                        onClick={() => navigate('/upload')}
                        className="flex items-center space-x-3 px-4 py-3 text-gray-600 hover:bg-gray-50 hover:text-portalBlue rounded-lg font-medium transition-colors w-full text-left"
                    >
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
            <main className="flex-1 flex flex-col overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 relative mb-16 md:mb-0">

                {/* Top Header */}
                <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 py-4 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-10 shadow-sm">
                    <div className="flex items-center md:hidden space-x-3" onClick={() => navigate('/dashboard')}>
                        <div className="w-8 h-8 bg-portalBlue rounded-lg flex items-center justify-center text-white shadow-sm">
                            <BookOpen size={16} />
                        </div>
                        <h2 className="text-lg font-bold text-portalBlue tracking-tight">Recent</h2>
                    </div>

                    <div className="hidden md:flex items-center space-x-3 text-sm font-medium text-gray-500">
                        <button onClick={() => navigate('/dashboard')} className="hover:text-portalBlue transition-colors">Dashboard</button>
                        <ChevronRight size={14} />
                        <span className="text-gray-900">Recently Viewed</span>
                    </div>

                    <div className="flex items-center space-x-4">
                        <button onClick={() => navigate('/profile')} className="text-gray-400 hover:text-portalBlue transition-colors group relative">
                            <UserCircle size={28} />
                        </button>
                    </div>
                </header>

                <div className="flex-1 overflow-auto p-4 sm:p-8 relative z-10">
                    <div className="max-w-6xl mx-auto space-y-6">

                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">History</h1>
                            <p className="text-gray-500 text-sm">Pick up right where you left off.</p>
                        </div>

                        {/* Recent Views Display */}
                        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
                            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                                <h3 className="text-lg font-bold text-gray-900 pt-0.5 flex items-center">
                                    <Clock size={20} className="mr-2 text-portalBlue" />
                                    Last Viewed Papers
                                </h3>
                            </div>
                            <div className="divide-y divide-gray-100">
                                {loadingPapers ? (
                                    <div className="p-12 text-center text-gray-500 space-y-4">
                                        <div className="w-8 h-8 border-4 border-portalBlue/30 border-t-portalBlue rounded-full animate-spin mx-auto"></div>
                                        <p className="font-medium animate-pulse">Fetching history...</p>
                                    </div>
                                ) : recentPapers.length === 0 ? (
                                    <div className="p-16 text-center text-gray-500 flex flex-col items-center">
                                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                            <Clock size={40} className="text-gray-300" />
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">Nothing here yet</h3>
                                        <p className="font-medium text-gray-500 max-w-sm mb-6">Papers you view or download will appear here automatically.</p>
                                        <button
                                            onClick={() => navigate('/search')}
                                            className="px-6 py-2.5 bg-blue-50 text-portalBlue rounded-xl text-sm font-bold shadow-sm hover:bg-portalBlue hover:text-white transition-all active:scale-95"
                                        >
                                            Explore Knowledge Base
                                        </button>
                                    </div>
                                ) : (
                                    recentPapers.map((paper) => (
                                        <div key={paper.id} className="p-5 sm:p-6 hover:bg-blue-50/30 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-5 group">
                                            <div className="flex items-start space-x-4 flex-1">
                                                <div className="p-3 bg-blue-50 text-portalBlue rounded-xl group-hover:scale-110 group-hover:bg-portalBlue group-hover:text-white transition-all shadow-sm flex-shrink-0">
                                                    <FileText size={24} />
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="text-lg font-bold text-gray-900 leading-tight group-hover:text-portalBlue transition-colors">{paper.title}</h4>

                                                    {/* Badges row */}
                                                    <div className="mt-2.5 flex flex-wrap items-center gap-2 text-xs font-bold text-gray-600">
                                                        <span className="bg-gray-100 px-2.5 py-1 rounded-md text-gray-700 tracking-wide">{paper.branch}</span>
                                                        <span className="bg-blue-50 text-portalBlue px-2.5 py-1 rounded-md">{paper.resource_type}</span>
                                                        <span className="bg-orange-50 text-portalOrange px-2.5 py-1 rounded-md">Year {paper.year}</span>
                                                        <span className="text-gray-400 pl-1 font-medium italic">
                                                            Viewed: {new Date(paper.viewed_at).toLocaleDateString()} at {new Date(paper.viewed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>

                                                    {/* Uploader row */}
                                                    <div className="mt-2.5 flex items-center text-xs font-medium text-gray-500 bg-gray-50 px-2.5 py-1.5 rounded-lg w-fit border border-gray-100">
                                                        <UserCircle size={14} className="mr-1.5 text-gray-400" />
                                                        Uploaded by:
                                                        <span className="ml-1 text-gray-700 font-bold">{paper.students?.full_name || 'Anonymous'}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center space-x-2 w-full md:w-auto mt-2 md:mt-0 pt-3 md:pt-0 border-t border-gray-100 md:border-t-0 pl-14 md:pl-0">
                                                <button
                                                    onClick={() => handleViewPaper(paper)}
                                                    className="flex-1 md:flex-none justify-center px-5 py-2.5 text-sm font-bold text-white bg-portalBlue hover:bg-blue-800 rounded-xl transition-colors shadow-md shadow-blue-200 active:scale-95 flex items-center"
                                                >
                                                    Open Paper
                                                </button>
                                                <a
                                                    href={paper.file_url}
                                                    onClick={() => handleDownloadPaper(paper)}
                                                    download
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-2.5 text-gray-400 hover:text-portalOrange bg-gray-50 hover:bg-orange-50 rounded-xl transition-colors shrink-0"
                                                    title="Download File"
                                                >
                                                    <Download size={20} />
                                                </a>
                                                <button
                                                    onClick={() => openSaveModal(paper)}
                                                    className="p-2.5 text-gray-400 hover:text-portalBlue bg-gray-50 hover:bg-blue-50 rounded-xl transition-colors shrink-0 md:flex flex-col items-center justify-center hidden sm:flex"
                                                    title="Save to Folder"
                                                >
                                                    <Bookmark size={20} />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            </main>

            {/* Save Paper Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h3 className="text-lg font-bold text-gray-900 flex items-center">
                                <Bookmark className="text-portalBlue mr-2" size={20} />
                                Save to Folder
                            </h3>
                            <button onClick={closeSaveModal} className="text-gray-400 hover:text-gray-700 transition-colors p-1">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto">
                            <p className="text-sm text-gray-600 mb-4 font-medium">
                                Saving: <span className="text-gray-900 font-bold">{selectedPaperToSave?.title}</span>
                            </p>

                            {saveMessage && (
                                <div className={`mb-4 p-3 rounded-lg text-sm font-semibold text-center ${saveMessage.includes('success') ? 'bg-green-50 text-green-700' : saveMessage.includes('Already') ? 'bg-orange-50 text-portalOrange' : 'bg-red-50 text-red-600'}`}>
                                    {saveMessage}
                                </div>
                            )}

                            {loadingFolders ? (
                                <div className="py-8 text-center text-gray-500 text-sm font-medium">Loading folders...</div>
                            ) : folders.length === 0 ? (
                                <div className="text-center py-6">
                                    <p className="text-gray-500 text-sm mb-4">You haven't created any folders yet.</p>
                                    <button
                                        onClick={() => navigate('/saved-papers')}
                                        className="px-4 py-2 bg-portalBlue text-white rounded-lg text-sm font-bold shadow-sm hover:bg-blue-800 transition-colors"
                                    >
                                        Create a Folder First
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {folders.map(folder => (
                                        <button
                                            key={folder.id}
                                            onClick={() => handleSaveToFolder(folder.id)}
                                            className="w-full text-left px-4 py-3 rounded-xl border border-gray-100 hover:border-portalBlue hover:bg-blue-50/50 transition-all flex items-center justify-between group"
                                        >
                                            <span className="font-semibold text-gray-800 group-hover:text-portalBlue">{folder.folder_name}</span>
                                            <FolderPlus size={18} className="text-gray-400 group-hover:text-portalBlue" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

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

export default RecentlyViewedPage;
