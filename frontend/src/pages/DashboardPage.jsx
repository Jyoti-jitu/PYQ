import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
    BookOpen,
    LogOut,
    FileText,
    Download,
    Clock,
    Bookmark,
    ChevronRight,
    UserCircle,
    Upload,
    FolderPlus,
    X,
    Search,
    Filter
} from 'lucide-react';

const DashboardPage = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    const [recentPapers, setRecentPapers] = useState([]);
    const [loadingPapers, setLoadingPapers] = useState(true);

    // Fetch PYQs function
    const fetchPyqs = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/pyq');
            setRecentPapers(response.data.pyqs || []);
        } catch (error) {
            console.error("Error fetching PYQs:", error);
        } finally {
            setLoadingPapers(false);
        }
    };

    // Simulated check for logged in user (in a real app, use Context or Redux)
    useEffect(() => {
        const loggedInUser = localStorage.getItem('user');
        if (loggedInUser) {
            const parsedUser = JSON.parse(loggedInUser);
            setUser(parsedUser);
            fetchPyqs(); // Fetch PYQs once user is set
        } else {
            navigate('/login');
        }
    }, [navigate]);

    const handleLogView = async (pyqId) => {
        if (!user || user.roll_number === 'N/A') return; // Don't log for dummy user
        try {
            await axios.post('http://localhost:5000/api/pyq/view', {
                userId: user.id,
                pyqId: pyqId
            });
        } catch (error) {
            console.error('Error logging view:', error);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/login');
    };

    // PDF Viewer State
    const [viewingPdfUrl, setViewingPdfUrl] = useState(null);

    // --- Saved Papers Modal State ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPaperToSave, setSelectedPaperToSave] = useState(null);
    const [folders, setFolders] = useState([]);
    const [loadingFolders, setLoadingFolders] = useState(false);
    const [saveMessage, setSaveMessage] = useState('');

    const openSaveModal = async (paper) => {
        setSelectedPaperToSave(paper);
        setIsModalOpen(true);
        setSaveMessage('');

        if (!user || user.roll_number === 'N/A') return;

        setLoadingFolders(true);
        try {
            const res = await axios.get(`http://localhost:5000/api/folders/${user.id}`);
            setFolders(res.data.folders || []);
        } catch (error) {
            console.error('Error fetching folders:', error);
        } finally {
            setLoadingFolders(false);
        }
    };

    const handleSaveToFolder = async (folderId) => {
        try {
            await axios.post('http://localhost:5000/api/folders/save-paper', {
                folderId,
                pyqId: selectedPaperToSave.id
            });
            setSaveMessage('Saved successfully!');
            setTimeout(() => setIsModalOpen(false), 1500);
        } catch (error) {
            if (error.response?.data?.error === 'Paper already saved in this folder') {
                setSaveMessage('Already saved here!');
            } else {
                setSaveMessage('Failed to save.');
            }
        }
    };

    const closeSaveModal = () => {
        setIsModalOpen(false);
        setSelectedPaperToSave(null);
        setSaveMessage('');
    };

    // --- Search & Filter State ---
    const [searchTerm, setSearchTerm] = useState('');
    const [filterBranch, setFilterBranch] = useState('All');
    const [filterYear, setFilterYear] = useState('All');

    // Extract unique branches and years for filter dropdowns
    const uniqueBranches = ['All', ...new Set(recentPapers.map(p => p.branch))];
    const uniqueYears = ['All', ...new Set(recentPapers.map(p => p.year))].sort((a, b) => b - a);

    // Apply filters
    const filteredPapers = recentPapers.filter(paper => {
        const matchesSearch = paper.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            paper.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesBranch = filterBranch === 'All' || paper.branch === filterBranch;
        const matchesYear = filterYear === 'All' || paper.year === filterYear;

        return matchesSearch && matchesBranch && matchesYear;
    });

    const handleViewPaper = (paper) => {
        handleLogView(paper.id);
        setViewingPdfUrl(paper.file_url);
    };

    const handleDownloadPaper = (paper) => {
        handleLogView(paper.id);
    };

    return (
        <div className="min-h-screen bg-portalBgLight flex font-sans">

            {/* Sidebar Navigation */}
            <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col shadow-sm z-10">
                <div className="p-6 border-b border-gray-100 flex items-center space-x-3">
                    <div className="w-10 h-10 bg-portalBlue rounded-lg flex items-center justify-center text-white shadow-md">
                        <BookOpen size={20} />
                    </div>
                    <h2 className="text-xl font-bold text-portalBlue tracking-tight uppercase">GITA PYQ</h2>
                </div>

                <nav className="flex-1 p-4 flex flex-col gap-2">
                    <button onClick={() => navigate('/dashboard')} className="flex items-center space-x-3 px-4 py-3 bg-blue-50 text-portalBlue rounded-lg font-medium transition-colors w-full text-left">
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
                    <button onClick={() => navigate('/recently-viewed')} className="flex items-center space-x-3 px-4 py-3 text-gray-600 hover:bg-gray-50 hover:text-portalBlue rounded-lg font-medium transition-colors w-full text-left">
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

                <div className="p-4 border-t border-gray-100">
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
            <main className="flex-1 flex flex-col overflow-hidden">
                {/* Top Header */}
                <header className="bg-white border-b border-gray-200 py-4 px-6 sm:px-8 flex items-center justify-between sticky top-0 z-10 shadow-sm">
                    <div className="flex items-center md:hidden space-x-3">
                        {/* Mobile Header Logo */}
                        <div className="w-8 h-8 bg-portalBlue rounded-lg flex items-center justify-center text-white shadow-sm">
                            <BookOpen size={16} />
                        </div>
                        <h2 className="text-lg font-bold text-portalBlue tracking-tight">GITA PYQ</h2>
                    </div>

                    <div className="hidden md:block">
                        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                    </div>



                    <div className="flex items-center space-x-4">
                        <button onClick={() => navigate('/profile')} className="text-gray-400 hover:text-portalBlue transition-colors group relative">
                            <UserCircle size={28} />
                            <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                View Profile
                            </span>
                        </button>
                        <div className="hidden sm:block text-right">
                            <p className="text-sm font-semibold text-gray-900">{user?.full_name || 'Student'}</p>
                            <p className="text-xs text-gray-500">{user?.branch || 'General'} | {user?.roll_number || 'N/A'}</p>
                        </div>
                    </div>
                </header>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-auto p-6 sm:p-8 bg-gray-50 bg-gradient-to-br from-gray-50 to-gray-100">

                    <div className="max-w-6xl mx-auto space-y-8">
                        {/* Welcome Banner */}
                        <div className="bg-portalBlue rounded-2xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
                            <div className="relative z-10">
                                <h2 className="text-2xl sm:text-3xl font-bold mb-2">Welcome back, {user?.full_name?.split(' ')[0] || 'Student'}! 👋</h2>
                                <p className="text-blue-100 max-w-xl text-sm sm:text-base">
                                    Ready for your exams? Access thousands of previous year question papers instantly.
                                    Your next exam is just around the corner.
                                </p>
                            </div>
                            {/* Decorative background shapes */}
                            <div className="absolute right-0 top-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/3"></div>
                            <div className="absolute right-12 bottom-0 w-32 h-32 bg-portalOrange opacity-20 rounded-full translate-y-1/3"></div>

                            <div className="relative z-10 mt-6 flex gap-4">
                                <button
                                    onClick={() => navigate('/upload')}
                                    className="bg-white text-portalBlue flex items-center px-5 py-2.5 rounded-lg font-medium shadow-md hover:bg-gray-50 transition-colors"
                                >
                                    <Upload size={18} className="mr-2" />
                                    Upload PYQ
                                </button>
                                <button className="bg-portalOrange text-white flex items-center px-5 py-2.5 rounded-lg font-medium shadow-md hover:bg-orange-600 transition-colors">
                                    <FileText size={18} className="mr-2" />
                                    Browse Papers
                                </button>
                            </div>
                        </div>

                        {/* Stat Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center space-x-4 hover:shadow-md transition-shadow">
                                <div className="p-3 bg-blue-50 text-portalBlue rounded-lg">
                                    <FileText size={24} />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 font-medium">Papers Viewed</p>
                                    <h3 className="text-2xl font-bold text-gray-900">14</h3>
                                </div>
                            </div>
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center space-x-4 hover:shadow-md transition-shadow">
                                <div className="p-3 bg-orange-50 text-portalOrange rounded-lg">
                                    <Download size={24} />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 font-medium">Downloads</p>
                                    <h3 className="text-2xl font-bold text-gray-900">8</h3>
                                </div>
                            </div>
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center space-x-4 hover:shadow-md transition-shadow sm:col-span-2 lg:col-span-1">
                                <div className="p-3 bg-green-50 text-green-600 rounded-lg">
                                    <Bookmark size={24} />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 font-medium">Saved for Later</p>
                                    <h3 className="text-2xl font-bold text-gray-900">3</h3>
                                </div>
                            </div>
                        </div>



                        {/* Recent Papers Section */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/30">
                                <h3 className="text-lg font-bold text-gray-900">
                                    {searchTerm || filterBranch !== 'All' || filterYear !== 'All'
                                        ? `Search Results (${filteredPapers.length})`
                                        : `Recommended for ${user?.branch || 'You'}`}
                                </h3>
                            </div>
                            <div className="divide-y divide-gray-100">
                                {loadingPapers ? (
                                    <div className="p-8 text-center text-gray-500">Loading recent papers...</div>
                                ) : filteredPapers.length === 0 ? (
                                    <div className="p-12 text-center text-gray-500">
                                        <Search size={32} className="mx-auto mb-3 text-gray-300" />
                                        <p className="font-medium text-gray-600">No papers found matching your criteria.</p>
                                        <button
                                            onClick={() => { setSearchTerm(''); setFilterBranch('All'); setFilterYear('All'); }}
                                            className="mt-4 px-4 py-2 bg-blue-50 text-portalBlue rounded-lg text-sm font-semibold hover:bg-blue-100 transition-colors"
                                        >
                                            Clear Filters
                                        </button>
                                    </div>
                                ) : (
                                    filteredPapers.map((paper) => (
                                        <div key={paper.id} className="p-6 hover:bg-gray-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                            <div className="flex items-start space-x-4">
                                                <div className="p-2 bg-gray-100 rounded-md text-gray-500 mt-1 sm:mt-0">
                                                    <FileText size={20} />
                                                </div>
                                                <div>
                                                    <h4 className="text-base font-semibold text-gray-900 leading-tight">{paper.title}</h4>
                                                    <div className="mt-1 flex items-center space-x-3 text-xs font-medium text-gray-500">
                                                        <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-600 font-bold">{paper.branch}</span>
                                                        <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-600">{paper.resource_type}</span>
                                                        <span>Year: {paper.year}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2 sm:self-center ml-12 sm:ml-0">
                                                <button
                                                    onClick={() => handleViewPaper(paper)}
                                                    className="px-4 py-2 text-sm font-medium text-portalBlue bg-blue-50 hover:bg-portalBlue hover:text-white rounded-lg transition-colors flex items-center"
                                                >
                                                    View
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
                                                    className="p-2 text-gray-400 hover:text-portalBlue bg-gray-50 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Save to Folder"
                                                >
                                                    <Bookmark size={18} />
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

export default DashboardPage;
