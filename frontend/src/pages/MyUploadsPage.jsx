import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
    BookOpen, FileText, Bookmark, Clock, Upload, LogOut, UserCircle,
    ChevronRight, ChevronDown, Download, X, FolderPlus, Folder,
    Search, Trash2, ShieldAlert, Plus, FolderOpen
} from 'lucide-react';

const API = import.meta.env.VITE_API_URL;
const UF = `${API}/upload-folders`; // My Uploads dedicated folder API

const MyUploadsPage = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    // ── Papers ──────────────────────────────────────────────────────────
    const [myPapers, setMyPapers] = useState([]);
    const [loadingPapers, setLoadingPapers] = useState(true);

    // ── Folders ─────────────────────────────────────────────────────────
    const [folders, setFolders] = useState([]);
    const [loadingFolders, setLoadingFolders] = useState(false);
    const [folderPapers, setFolderPapers] = useState({}); // { folderId: [pyq, ...] }
    const [openFolders, setOpenFolders] = useState({});   // { folderId: bool }

    // Create-folder inline
    const [showNewFolder, setShowNewFolder] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    const [creatingFolder, setCreatingFolder] = useState(false);

    // ── Add-to-folder modal ─────────────────────────────────────────────
    const [addModalPaper, setAddModalPaper] = useState(null); // paper to add
    const [addMessage, setAddMessage] = useState('');

    // ── Delete modal ─────────────────────────────────────────────────────
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [paperToDelete, setPaperToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // ── PDF viewer ───────────────────────────────────────────────────────
    const [viewingPdfUrl, setViewingPdfUrl] = useState(null);

    // ────────────────────────────────────────────────────────────────────
    // Bootstrap
    // ────────────────────────────────────────────────────────────────────
    useEffect(() => {
        const stored = localStorage.getItem('user');
        if (stored) {
            const u = JSON.parse(stored);
            setUser(u);
            fetchMyUploads(u.id);
            fetchFolders(u.id);
        } else {
            navigate('/login');
        }
    }, [navigate]);

    // ────────────────────────────────────────────────────────────────────
    // Data fetching
    // ────────────────────────────────────────────────────────────────────
    const fetchMyUploads = async (userId) => {
        setLoadingPapers(true);
        try {
            const res = await axios.get(`${API}/pyq/user/${userId}`);
            setMyPapers(res.data.pyqs || []);
        } catch (e) {
            console.error('Error fetching uploads:', e);
        } finally {
            setLoadingPapers(false);
        }
    };

    const fetchFolders = async (userId) => {
        setLoadingFolders(true);
        try {
            const res = await axios.get(`${UF}/user/${userId}`);
            const flist = res.data.folders || [];
            setFolders(flist);
            // Fetch papers for each upload folder
            const map = {};
            await Promise.all(flist.map(async (f) => {
                try {
                    const r = await axios.get(`${UF}/${f.id}/papers`);
                    // each item is { id, added_at, pyqs: { ...pyq cols } }
                    map[f.id] = (r.data.papers || []).map(sp => sp.pyqs).filter(Boolean);
                } catch (_) {
                    map[f.id] = [];
                }
            }));
            setFolderPapers(map);
        } catch (e) {
            console.error('Error fetching upload folders:', e);
        } finally {
            setLoadingFolders(false);
        }
    };

    // ────────────────────────────────────────────────────────────────────
    // Folder actions
    // ────────────────────────────────────────────────────────────────────
    const handleCreateFolder = async (e) => {
        e.preventDefault();
        if (!newFolderName.trim() || !user) return;
        setCreatingFolder(true);
        try {
            const res = await axios.post(`${UF}/create`, {
                userId: user.id,
                folderName: newFolderName.trim(),
            });
            const created = res.data.folder;
            setFolders(prev => [created, ...prev]);
            setFolderPapers(prev => ({ [created.id]: [], ...prev }));
            setNewFolderName('');
            setShowNewFolder(false);
        } catch (e) {
            console.error('Error creating folder:', e);
        } finally {
            setCreatingFolder(false);
        }
    };

    const toggleFolder = (folderId) => {
        setOpenFolders(prev => ({ ...prev, [folderId]: !prev[folderId] }));
    };

    // ────────────────────────────────────────────────────────────────────
    // Add paper to folder (from modal)
    // ────────────────────────────────────────────────────────────────────
    const openAddModal = (paper) => {
        setAddModalPaper(paper);
        setAddMessage('');
    };

    const closeAddModal = () => {
        setAddModalPaper(null);
        setAddMessage('');
    };

    const handleAddToFolder = async (folderId) => {
        if (!addModalPaper) return;
        try {
            await axios.post(`${UF}/add-paper`, {
                folderId,
                pyqId: addModalPaper.id,
            });
            // Update local folderPapers immediately
            setFolderPapers(prev => ({
                ...prev,
                [folderId]: [...(prev[folderId] || []), addModalPaper],
            }));
            setAddMessage('✓ Added successfully!');
            setTimeout(closeAddModal, 1200);
        } catch (e) {
            if (e.response?.status === 400) {
                setAddMessage('Already in this folder');
            } else {
                setAddMessage('Failed to add paper');
            }
        }
    };

    // ────────────────────────────────────────────────────────────────────
    // Paper actions
    // ────────────────────────────────────────────────────────────────────
    const handleLogView = async (pyqId) => {
        if (!user) return;
        try {
            await axios.post(`${API}/pyq/view`, { userId: user.id, pyqId });
        } catch (_) { }
    };

    const handleViewPaper = (paper) => {
        handleLogView(paper.id);
        setViewingPdfUrl(paper.file_url);
    };

    const handleDownloadPaper = (paper) => {
        handleLogView(paper.id);
    };

    const openDeleteModal = (paper) => {
        setPaperToDelete(paper);
        setIsDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setPaperToDelete(null);
        setIsDeleting(false);
    };

    const confirmDelete = async () => {
        if (!user || !paperToDelete) return;
        setIsDeleting(true);
        try {
            await axios.delete(`${API}/pyq/${paperToDelete.id}`, { data: { userId: user.id } });
            setMyPapers(prev => prev.filter(p => p.id !== paperToDelete.id));
            // Also remove from folderPapers
            setFolderPapers(prev => {
                const next = { ...prev };
                Object.keys(next).forEach(fid => {
                    next[fid] = next[fid].filter(p => p.id !== paperToDelete.id);
                });
                return next;
            });
            closeDeleteModal();
        } catch (e) {
            alert(e.response?.data?.error || 'Failed to delete paper.');
            setIsDeleting(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/login');
    };

    // ────────────────────────────────────────────────────────────────────
    // Derived data
    // ────────────────────────────────────────────────────────────────────
    // IDs of papers that appear in at least one folder
    const organizedIds = new Set(
        Object.values(folderPapers).flat().map(p => p?.id).filter(Boolean)
    );
    const unorganized = myPapers.filter(p => !organizedIds.has(p.id));

    if (!user) return null;

    // ────────────────────────────────────────────────────────────────────
    // Sub-components
    // ────────────────────────────────────────────────────────────────────
    const PaperRow = ({ paper, inFolder = false }) => (
        <div className="px-5 py-4 hover:bg-blue-50/30 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 group border-b border-gray-100 last:border-b-0">
            <div className="flex items-start space-x-3 flex-1 min-w-0">
                <div className="p-2.5 bg-blue-50 text-portalBlue rounded-xl group-hover:bg-portalBlue group-hover:text-white transition-all flex-shrink-0">
                    <FileText size={18} />
                </div>
                <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-gray-900 leading-tight group-hover:text-portalBlue transition-colors truncate">{paper.title}</h4>
                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs font-semibold">
                        <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-600">{paper.branch}</span>
                        <span className="bg-blue-50 text-portalBlue px-2 py-0.5 rounded">{paper.resource_type}</span>
                        <span className="bg-orange-50 text-orange-500 px-2 py-0.5 rounded">Year {paper.year}</span>
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-2 pl-10 sm:pl-0">
                <button
                    onClick={() => handleViewPaper(paper)}
                    className="px-4 py-2 text-xs font-bold text-portalBlue bg-blue-50 hover:bg-portalBlue hover:text-white rounded-lg transition-colors"
                >
                    Open
                </button>
                {!inFolder && (
                    <button
                        onClick={() => openAddModal(paper)}
                        className="p-2 text-gray-400 hover:text-portalBlue bg-gray-50 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Add to Folder"
                    >
                        <FolderPlus size={16} />
                    </button>
                )}
                <a
                    href={paper.file_url}
                    onClick={() => handleDownloadPaper(paper)}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-gray-400 hover:text-orange-500 bg-gray-50 hover:bg-orange-50 rounded-lg transition-colors"
                    title="Download"
                >
                    <Download size={16} />
                </a>
                <button
                    onClick={() => openDeleteModal(paper)}
                    className="p-2 text-gray-400 hover:text-red-500 bg-gray-50 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                >
                    <Trash2 size={16} />
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-portalBgLight flex font-sans">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col shadow-sm z-10 fixed h-full">
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
                        <FileText size={20} /><span>All Papers</span>
                    </button>
                    <button onClick={() => navigate('/search')} className="flex items-center space-x-3 px-4 py-3 text-gray-600 hover:bg-gray-50 hover:text-portalBlue rounded-lg font-medium transition-colors w-full text-left">
                        <Search size={20} /><span>Search Papers</span>
                    </button>
                    <button onClick={() => navigate('/saved-papers')} className="flex items-center space-x-3 px-4 py-3 text-gray-600 hover:bg-gray-50 hover:text-portalBlue rounded-lg font-medium transition-colors w-full text-left">
                        <Bookmark size={20} /><span>Saved Papers</span>
                    </button>
                    <button onClick={() => navigate('/recently-viewed')} className="flex items-center space-x-3 px-4 py-3 text-gray-600 hover:bg-gray-50 hover:text-portalBlue rounded-lg font-medium transition-colors w-full text-left">
                        <Clock size={20} /><span>Recently Viewed</span>
                    </button>
                    <button onClick={() => navigate('/my-uploads')} className="flex items-center space-x-3 px-4 py-3 bg-blue-50 text-portalBlue rounded-lg font-medium transition-colors w-full text-left">
                        <FileText size={20} /><span>My Uploads</span>
                    </button>
                    <button onClick={() => navigate('/upload')} className="flex items-center space-x-3 px-4 py-3 text-gray-600 hover:bg-gray-50 hover:text-portalBlue rounded-lg font-medium transition-colors w-full text-left">
                        <Upload size={20} /><span>Upload PYQ</span>
                    </button>
                </nav>
                <div className="p-4 border-t border-gray-100">
                    <button onClick={handleLogout} className="flex items-center space-x-3 px-4 py-3 w-full text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors">
                        <LogOut size={20} /><span>Log Out</span>
                    </button>
                </div>
            </aside>

            {/* Main */}
            <main className="flex-1 flex flex-col overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 md:ml-64">
                {/* Header */}
                <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 py-4 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-10 shadow-sm">
                    <div className="flex items-center md:hidden space-x-3" onClick={() => navigate('/dashboard')}>
                        <div className="w-8 h-8 bg-portalBlue rounded-lg flex items-center justify-center text-white shadow-sm">
                            <BookOpen size={16} />
                        </div>
                        <h2 className="text-lg font-bold text-portalBlue tracking-tight">Uploads</h2>
                    </div>
                    <div className="hidden md:flex items-center space-x-3 text-sm font-medium text-gray-500">
                        <button onClick={() => navigate('/dashboard')} className="hover:text-portalBlue transition-colors">Dashboard</button>
                        <ChevronRight size={14} />
                        <span className="text-gray-900">My Uploads</span>
                    </div>
                    <div className="flex items-center space-x-4">
                        <button onClick={() => navigate('/profile')} className="text-gray-400 hover:text-portalBlue transition-colors">
                            <UserCircle size={28} />
                        </button>
                    </div>
                </header>

                <div className="flex-1 overflow-auto p-4 sm:p-8">
                    <div className="max-w-4xl mx-auto space-y-8">

                        {/* Page title + actions */}
                        <div className="flex items-end justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 mb-1">My Uploads</h1>
                                <p className="text-gray-500 text-sm">{myPapers.length} paper{myPapers.length !== 1 ? 's' : ''} contributed</p>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => { setShowNewFolder(v => !v); setNewFolderName(''); }}
                                    className="px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-bold rounded-xl shadow-sm hover:border-portalBlue hover:text-portalBlue transition-all flex items-center gap-2"
                                >
                                    <FolderPlus size={16} />
                                    New Folder
                                </button>
                                <button
                                    onClick={() => navigate('/upload')}
                                    className="px-4 py-2 bg-portalBlue text-white text-sm font-bold rounded-xl shadow-md hover:bg-blue-800 transition-colors flex items-center gap-2"
                                >
                                    <Upload size={16} />
                                    New Upload
                                </button>
                            </div>
                        </div>

                        {/* Inline create-folder form */}
                        {showNewFolder && (
                            <form
                                onSubmit={handleCreateFolder}
                                className="bg-white rounded-2xl border border-blue-200 shadow-sm p-5 flex gap-3 items-center animate-in slide-in-from-top-2 duration-200"
                            >
                                <FolderOpen size={20} className="text-portalBlue flex-shrink-0" />
                                <input
                                    autoFocus
                                    type="text"
                                    value={newFolderName}
                                    onChange={e => setNewFolderName(e.target.value)}
                                    placeholder="Folder name (e.g. Sem 6 – CS)"
                                    className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-portalBlue focus:border-transparent outline-none"
                                />
                                <button
                                    type="submit"
                                    disabled={!newFolderName.trim() || creatingFolder}
                                    className="px-5 py-2.5 bg-portalBlue disabled:bg-blue-300 text-white text-sm font-bold rounded-xl transition-colors"
                                >
                                    {creatingFolder ? 'Creating…' : 'Create'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowNewFolder(false)}
                                    className="p-2 text-gray-400 hover:text-gray-700 rounded-lg"
                                >
                                    <X size={18} />
                                </button>
                            </form>
                        )}

                        {/* ── Folder sections ── */}
                        {loadingFolders ? (
                            <div className="flex items-center gap-3 text-gray-500 text-sm py-4">
                                <div className="w-5 h-5 border-2 border-portalBlue/30 border-t-portalBlue rounded-full animate-spin" />
                                Loading folders…
                            </div>
                        ) : folders.length === 0 ? (
                            <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-8 text-center text-gray-400">
                                <Folder size={36} className="mx-auto mb-3 text-gray-300" />
                                <p className="font-medium text-sm">No folders yet. Click <strong>"New Folder"</strong> to create one.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {folders.map(folder => {
                                    const isOpen = !!openFolders[folder.id];
                                    const papers = folderPapers[folder.id] || [];
                                    return (
                                        <div key={folder.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                            {/* Folder header */}
                                            <button
                                                onClick={() => toggleFolder(folder.id)}
                                                className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors group"
                                            >
                                                <div className="flex items-center gap-3">
                                                    {isOpen
                                                        ? <FolderOpen size={22} className="text-portalBlue" />
                                                        : <Folder size={22} className="text-portalBlue/70 group-hover:text-portalBlue transition-colors" />
                                                    }
                                                    <span className="text-base font-bold text-gray-900">{folder.folder_name}</span>
                                                    <span className="text-xs text-gray-400 font-medium bg-gray-100 px-2 py-0.5 rounded-full">
                                                        {papers.length} file{papers.length !== 1 ? 's' : ''}
                                                    </span>
                                                </div>
                                                {isOpen
                                                    ? <ChevronDown size={18} className="text-gray-400" />
                                                    : <ChevronRight size={18} className="text-gray-300 group-hover:text-gray-500 transition-colors" />
                                                }
                                            </button>

                                            {/* Folder contents */}
                                            {isOpen && (
                                                <div className="border-t border-gray-100">
                                                    {papers.length === 0 ? (
                                                        <div className="py-8 text-center text-gray-400 text-sm">
                                                            <FileText size={28} className="mx-auto mb-2 text-gray-200" />
                                                            This folder is empty. Use the <strong>Add to Folder</strong> button on a paper to add files here.
                                                        </div>
                                                    ) : (
                                                        papers.map(paper => (
                                                            <PaperRow key={paper.id} paper={paper} inFolder={true} />
                                                        ))
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* ── Unorganized Uploads ── */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                                    <FileText size={18} className="text-portalBlue" />
                                    {folders.length > 0 ? 'Unorganized Uploads' : 'All Uploads'}
                                    <span className="text-xs text-gray-400 font-medium bg-gray-100 px-2 py-0.5 rounded-full">
                                        {loadingPapers ? '…' : unorganized.length}
                                    </span>
                                </h3>
                            </div>

                            {loadingPapers ? (
                                <div className="p-12 text-center text-gray-500 space-y-3">
                                    <div className="w-8 h-8 border-4 border-portalBlue/30 border-t-portalBlue rounded-full animate-spin mx-auto" />
                                    <p className="text-sm font-medium animate-pulse">Fetching your uploads…</p>
                                </div>
                            ) : unorganized.length === 0 ? (
                                <div className="p-12 text-center text-gray-400 flex flex-col items-center">
                                    <Upload size={36} className="text-gray-200 mb-3" />
                                    <p className="text-sm font-medium">
                                        {myPapers.length === 0
                                            ? "You haven't uploaded anything yet."
                                            : "All your uploads are organized in folders 🎉"}
                                    </p>
                                    {myPapers.length === 0 && (
                                        <button
                                            onClick={() => navigate('/upload')}
                                            className="mt-4 px-5 py-2 bg-blue-50 text-portalBlue text-sm font-bold rounded-xl hover:bg-portalBlue hover:text-white transition-all"
                                        >
                                            Upload First Document
                                        </button>
                                    )}
                                </div>
                            ) : (
                                unorganized.map(paper => (
                                    <PaperRow key={paper.id} paper={paper} inFolder={false} />
                                ))
                            )}
                        </div>

                    </div>
                </div>
            </main>

            {/* ─── Add to Folder Modal ─── */}
            {addModalPaper && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <FolderPlus className="text-portalBlue" size={20} />
                                Add to Folder
                            </h3>
                            <button onClick={closeAddModal} className="text-gray-400 hover:text-gray-700 p-1"><X size={20} /></button>
                        </div>

                        <div className="p-6 overflow-y-auto">
                            <p className="text-sm text-gray-500 mb-4 font-medium">
                                Adding: <span className="text-gray-900 font-bold">{addModalPaper.title}</span>
                            </p>

                            {addMessage && (
                                <div className={`mb-4 p-3 rounded-lg text-sm font-semibold text-center ${addMessage.startsWith('✓') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                                    {addMessage}
                                </div>
                            )}

                            {/* Inline create folder inside modal */}
                            {!showNewFolder ? (
                                <button
                                    onClick={() => setShowNewFolder(true)}
                                    className="w-full flex items-center gap-3 px-4 py-3 mb-3 border border-dashed border-blue-200 text-portalBlue rounded-xl hover:bg-blue-50 transition-colors text-sm font-bold"
                                >
                                    <Plus size={16} /> Create New Folder
                                </button>
                            ) : (
                                <form onSubmit={handleCreateFolder} className="flex gap-2 mb-3">
                                    <input
                                        autoFocus
                                        type="text"
                                        value={newFolderName}
                                        onChange={e => setNewFolderName(e.target.value)}
                                        placeholder="Folder name"
                                        className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-portalBlue outline-none"
                                    />
                                    <button
                                        type="submit"
                                        disabled={!newFolderName.trim() || creatingFolder}
                                        className="px-4 py-2 bg-portalBlue disabled:bg-blue-300 text-white text-sm font-bold rounded-xl"
                                    >
                                        {creatingFolder ? '…' : 'Create'}
                                    </button>
                                    <button type="button" onClick={() => { setShowNewFolder(false); setNewFolderName(''); }} className="p-2 text-gray-400 hover:text-gray-700"><X size={16} /></button>
                                </form>
                            )}

                            {folders.length === 0 ? (
                                <p className="text-center text-sm text-gray-400 py-4">No folders yet – create one above.</p>
                            ) : (
                                <div className="space-y-2">
                                    {folders.map(f => (
                                        <button
                                            key={f.id}
                                            onClick={() => handleAddToFolder(f.id)}
                                            className="w-full text-left px-4 py-3 rounded-xl border border-gray-100 hover:border-portalBlue hover:bg-blue-50/50 transition-all flex items-center justify-between group"
                                        >
                                            <div className="flex items-center gap-2">
                                                <Folder size={16} className="text-portalBlue/60 group-hover:text-portalBlue" />
                                                <span className="font-semibold text-gray-800 group-hover:text-portalBlue text-sm">{f.folder_name}</span>
                                            </div>
                                            <span className="text-xs text-gray-400">{(folderPapers[f.id] || []).length} files</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ─── Delete Modal ─── */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden">
                        <div className="p-6 flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
                                <ShieldAlert size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Delete PYQ?</h3>
                            <p className="text-sm text-gray-500 mb-6 font-medium leading-relaxed">
                                Are you sure you want to delete <span className="text-gray-900 font-bold">"{paperToDelete?.title}"</span>? This will permanently remove it from the system.
                            </p>
                            <div className="w-full flex space-x-3">
                                <button onClick={closeDeleteModal} disabled={isDeleting} className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors">
                                    Cancel
                                </button>
                                <button onClick={confirmDelete} disabled={isDeleting} className="flex-1 py-3 bg-red-500 disabled:bg-red-300 text-white font-bold rounded-xl hover:bg-red-600 transition-colors shadow-md shadow-red-200 flex items-center justify-center">
                                    {isDeleting ? 'Deleting…' : 'Yes, Delete'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ─── PDF Viewer ─── */}
            {viewingPdfUrl && (
                <div className="fixed inset-0 z-[100] flex flex-col bg-gray-900/95 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="flex justify-between items-center py-3 px-6 bg-gray-900 text-white shadow-xl border-b border-gray-800">
                        <h3 className="text-lg font-bold flex items-center tracking-wide">
                            <FileText className="mr-3 text-portalBlue" size={20} />
                            Document Viewer
                        </h3>
                        <div className="flex items-center gap-4">
                            <a href={viewingPdfUrl} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-portalBlue/20 text-blue-200 hover:bg-portalBlue hover:text-white rounded-lg text-sm font-bold transition-colors">
                                Open in New Tab
                            </a>
                            <button onClick={() => setViewingPdfUrl(null)} className="p-2 text-gray-400 hover:bg-red-500 hover:text-white rounded-lg transition-all">
                                <X size={24} />
                            </button>
                        </div>
                    </div>
                    <div className="flex-1 w-full bg-[#323639] p-2 lg:p-4">
                        <iframe src={viewingPdfUrl} className="w-full h-full rounded-xl shadow-2xl border-0 bg-white" title="PDF Inline Viewer" />
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyUploadsPage;
