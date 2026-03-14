import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
    X, Upload, File, Plus, XCircle, ArrowLeft,
    BookOpen, FileText, Bookmark, Clock, LogOut, UserCircle,
    ChevronRight, Folder,
    Search
} from 'lucide-react';

const UploadPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const folderId = searchParams.get('folderId');
    const folderName = searchParams.get('folderName');
    const [user, setUser] = useState(null);

    useEffect(() => {
        const loggedInUser = localStorage.getItem('user');
        if (loggedInUser) {
            setUser(JSON.parse(loggedInUser));
        } else {
            setUser({ full_name: 'Student', roll_number: 'N/A', branch: 'CSE' });
        }
    }, []);

    const [title, setTitle] = useState('');
    const [branch, setBranch] = useState('');
    const [semester, setSemester] = useState('');
    const [otherBranch, setOtherBranch] = useState('');
    const [year, setYear] = useState(new Date().getFullYear().toString());
    const [resourceType, setResourceType] = useState('');
    const [facultyName, setFacultyName] = useState('');
    const [tags, setTags] = useState([]);
    const [tagInput, setTagInput] = useState('');
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);

    const fileInputRef = useRef(null);

    const handleTagKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            const newTag = tagInput.trim().toUpperCase();
            if (newTag && !tags.includes(newTag)) {
                setTags([...tags, newTag]);
            }
            setTagInput('');
        }
    };

    const removeTag = (tagToRemove) => {
        setTags(tags.filter(tag => tag !== tagToRemove));
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/login');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setIsError(false);

        if (!title || !branch || (branch === 'Other' && !otherBranch) || !semester || !year || !resourceType || !file) {
            setIsError(true);
            setMessage('Please fill in all required fields (Faculty Name is optional)');
            return;
        }

        setLoading(true);

        const formData = new FormData();
        formData.append('title', title);
        formData.append('branch', branch === 'Other' ? otherBranch : branch);
        formData.append('semester', semester);
        formData.append('year', year);
        formData.append('resourceType', resourceType);
        if (facultyName) formData.append('facultyName', facultyName);
        formData.append('tags', JSON.stringify(tags));
        formData.append('file', file);
        if (user && user.id) {
            formData.append('userId', user.id);
        }
        if (folderId) {
            formData.append('folderId', folderId);
        }

        try {
            const response = await axios.post('http://localhost:5000/api/pyq/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            setMessage('PYQ Uploaded Successfully!');
            setTimeout(() => {
                if (folderId) {
                    navigate('/saved-papers');
                } else {
                    navigate('/dashboard');
                }
            }, 2000);
        } catch (error) {
            setIsError(true);
            setMessage(error.response?.data?.error || 'Upload failed. Ensure bucket is public.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-portalBgLight flex font-sans">

            {/* Sidebar Navigation */}
            <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col shadow-sm z-10">
                <div className="p-6 border-b border-gray-100 flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/dashboard')}>
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
                    <button onClick={() => navigate('/recently-viewed')} className="flex items-center space-x-3 px-4 py-3 text-gray-600 hover:bg-gray-50 hover:text-portalBlue rounded-lg font-medium transition-colors w-full text-left">
                        <Clock size={20} />
                        <span>Recently Viewed</span>
                    </button>
                    <button onClick={() => navigate('/my-uploads')} className="flex items-center space-x-3 px-4 py-3 text-gray-600 hover:bg-gray-50 hover:text-portalBlue rounded-lg font-medium transition-colors w-full text-left">
                        <FileText size={20} />
                        <span>My Uploads</span>
                    </button>
                    <button className="flex items-center space-x-3 px-4 py-3 bg-blue-50 text-portalBlue rounded-lg font-medium transition-colors w-full text-left">
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
            <main className="flex-1 flex flex-col overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 relative">

                {/* Decorative background blobs */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100 opacity-40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-orange-100 opacity-40 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3 pointer-events-none"></div>

                {/* Top Header */}
                <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 py-4 px-6 sm:px-8 flex items-center justify-between sticky top-0 z-10 shadow-sm">
                    <div className="flex items-center md:hidden space-x-3" onClick={() => navigate('/dashboard')}>
                        <div className="w-8 h-8 bg-portalBlue rounded-lg flex items-center justify-center text-white shadow-sm">
                            <BookOpen size={16} />
                        </div>
                        <h2 className="text-lg font-bold text-portalBlue tracking-tight">GITA PYQ</h2>
                    </div>

                    <div className="hidden md:flex items-center space-x-3 text-sm font-medium text-gray-500 whitespace-nowrap">
                        <button onClick={() => navigate('/dashboard')} className="hover:text-portalBlue transition-colors">Dashboard</button>
                        <ChevronRight size={14} />
                        <span className="text-gray-900">Upload PYQ</span>
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
                                if (q.trim()) navigate(`/ search ? q = ${encodeURIComponent(q.trim())} `);
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
                <div className="flex-1 overflow-auto p-6 sm:p-8 relative z-10">
                    <div className="max-w-4xl mx-auto space-y-8">



                        {/* Glassmorphic Upload Form Form */}
                        <div className="bg-white/70 backdrop-blur-lg rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/80 overflow-hidden">
                            <div className="p-8 sm:p-10">

                                <div className="mb-8 border-b border-gray-100 pb-4">
                                    <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                                        <File className="text-portalOrange mr-3" size={24} />
                                        Paper Details
                                    </h2>
                                    <p className="text-sm text-gray-500 mt-2">Please provide accurate information for better searchability.</p>
                                </div>

                                {message && (
                                    <div className={`mb-8 p-4 rounded-xl flex items-center shadow-sm ${isError ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-green-50 text-green-700 border border-green-100'}`}>
                                        {isError ? <XCircle size={22} className="mr-3 flex-shrink-0" /> : <Upload size={22} className="mr-3 flex-shrink-0" />}
                                        <span className="font-medium text-sm sm:text-base">{message}</span>
                                    </div>
                                )}

                                {folderId && (
                                    <div className="mb-8 p-3 rounded-xl flex items-center bg-blue-50 text-portalBlue border border-blue-100">
                                        <Folder size={20} className="mr-3 flex-shrink-0" />
                                        <span className="font-medium text-sm sm:text-base">
                                            Saving automatically to folder: <strong>{folderName}</strong>
                                        </span>
                                    </div>
                                )}

                                <form id="upload-form" onSubmit={handleSubmit} className="space-y-6">

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1.5 focus-within:text-portalBlue transition-colors">Subject Name *</label>
                                            <input
                                                type="text"
                                                className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-portalBlue/50 focus:border-portalBlue focus:bg-white transition-all shadow-sm"
                                                placeholder="e.g. Data Structures 2023"
                                                value={title}
                                                onChange={(e) => setTitle(e.target.value)}
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1.5 focus-within:text-portalBlue transition-colors">Branch *</label>
                                            <select
                                                className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-portalBlue/50 focus:border-portalBlue focus:bg-white transition-all shadow-sm appearance-none"
                                                value={branch}
                                                onChange={(e) => setBranch(e.target.value)}
                                                required
                                            >
                                                <option value="" disabled>Select Branch</option>
                                                <option value="CSE">CSE</option>
                                                <option value="CST">CST</option>
                                                <option value="ECE">ECE</option>
                                                <option value="EEE">EEE</option>
                                                <option value="EE">EE</option>
                                                <option value="ME">ME</option>
                                                <option value="CE">CE</option>
                                                <option value="IT">IT</option>
                                                <option value="MCA">MCA</option>
                                                <option value="MBA">MBA</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1.5 focus-within:text-portalBlue transition-colors">Semester *</label>
                                            <select
                                                className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-portalBlue/50 focus:border-portalBlue focus:bg-white transition-all shadow-sm appearance-none"
                                                value={semester}
                                                onChange={(e) => setSemester(e.target.value)}
                                                required
                                            >
                                                <option value="" disabled>Select Semester</option>
                                                <option value="1">1st Semester</option>
                                                <option value="2">2nd Semester</option>
                                                <option value="3">3rd Semester</option>
                                                <option value="4">4th Semester</option>
                                                <option value="5">5th Semester</option>
                                                <option value="6">6th Semester</option>
                                                <option value="7">7th Semester</option>
                                                <option value="8">8th Semester</option>
                                            </select>
                                        </div>

                                        {branch === 'Other' && (
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-1.5 focus-within:text-portalBlue transition-colors">Enter Branch Name *</label>
                                                <input
                                                    type="text"
                                                    className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-portalBlue/50 focus:border-portalBlue focus:bg-white transition-all shadow-sm"
                                                    placeholder="e.g. Chemical Engineering"
                                                    value={otherBranch}
                                                    onChange={(e) => setOtherBranch(e.target.value)}
                                                    required
                                                />
                                            </div>
                                        )}

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1.5 focus-within:text-portalBlue transition-colors">Year *</label>
                                            <input
                                                type="text"
                                                className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-portalBlue/50 focus:border-portalBlue focus:bg-white transition-all shadow-sm"
                                                placeholder="e.g. 2024"
                                                value={year}
                                                onChange={(e) => setYear(e.target.value)}
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1.5 focus-within:text-portalBlue transition-colors">Resource Type *</label>
                                            <select
                                                className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-portalBlue/50 focus:border-portalBlue focus:bg-white transition-all shadow-sm appearance-none"
                                                value={resourceType}
                                                onChange={(e) => setResourceType(e.target.value)}
                                                required
                                            >
                                                <option value="" disabled>Select Resource Type</option>
                                                <option value="End Sem">End Sem</option>
                                                <option value="Mid Sem">Mid Sem</option>
                                                <option value="Notes">Notes</option>
                                                <option value="Assignment">Assignment</option>
                                                <option value="Quiz">Quiz</option>
                                                <option value="Lab">Lab</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>

                                        <div className="sm:col-span-2">
                                            <label className="block text-sm font-semibold text-gray-700 mb-1.5 focus-within:text-portalBlue transition-colors">Faculty Name (Optional)</label>
                                            <input
                                                type="text"
                                                className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-portalBlue/50 focus:border-portalBlue focus:bg-white transition-all shadow-sm"
                                                placeholder="e.g. Dr. A.K. Sharma"
                                                value={facultyName}
                                                onChange={(e) => setFacultyName(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5 focus-within:text-portalBlue transition-colors">Tags</label>
                                        <div className="w-full p-2.5 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl focus-within:ring-2 focus-within:ring-portalBlue/50 focus-within:border-portalBlue focus-within:bg-white transition-all shadow-sm min-h-[56px] flex flex-wrap gap-2 items-center">
                                            {[...new Set([
                                                ...[title, branch === 'Other' ? otherBranch : branch, semester, year, resourceType, facultyName]
                                                    .filter(Boolean)
                                                    .map(t => t.toString().trim().toUpperCase()),
                                                ...tags
                                            ])].map((tag, index) => {
                                                const isAutoTag = [title, branch === 'Other' ? otherBranch : branch, semester, year, resourceType, facultyName]
                                                    .filter(Boolean)
                                                    .map(t => t.toString().trim().toUpperCase())
                                                    .includes(tag);

                                                return (
                                                    <span key={`${tag} -${index} `} className={`flex items - center px - 3 py - 1.5 rounded - lg text - sm font - semibold shadow - sm ${isAutoTag ? 'bg-orange-100/70 text-portalOrange' : 'bg-blue-100/70 text-portalBlue'} `}>
                                                        {tag}
                                                        {!isAutoTag && (
                                                            <button type="button" onClick={() => removeTag(tag)} className="ml-2 focus:outline-none text-portalBlue/70 hover:text-portalBlue hover:bg-white/50 p-0.5 rounded transition-colors">
                                                                <X size={14} />
                                                            </button>
                                                        )}
                                                    </span>
                                                );
                                            })}
                                            <input
                                                type="text"
                                                className="flex-grow min-w-[150px] outline-none border-none py-1.5 px-2 text-sm bg-transparent placeholder-gray-400"
                                                placeholder={tags.length === 0 ? "Type tag and press Enter (e.g. MIDSEM, 2023)" : "Add more tags..."}
                                                value={tagInput}
                                                onChange={(e) => setTagInput(e.target.value)}
                                                onKeyDown={handleTagKeyDown}
                                            />
                                        </div>
                                        <p className="text-xs text-gray-500 mt-2 ml-1">Add specific tags like branch, exam type, or year to help others find it faster.</p>
                                    </div>

                                    <div className="pt-2">
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">File Attachment</label>

                                        <div
                                            className={`relative group flex justify-center px-6 py-10 border-2 border-dashed rounded-2xl transition-all duration-300 cursor-pointer overflow-hidden ${file ? 'border-portalBlue bg-blue-50/50' : 'border-gray-300 hover:border-portalBlue bg-white/40 hover:bg-white/80'} shadow-sm`}
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            <div className="relative z-10 space-y-3 text-center">
                                                {file ? (
                                                    <div className="animate-in fade-in zoom-in duration-300">
                                                        <div className="mx-auto w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-4">
                                                            <File className="h-8 w-8 text-portalBlue" />
                                                        </div>
                                                        <div className="text-base text-portalBlue font-bold">{file.name}</div>
                                                        <p className="text-sm text-gray-500 font-medium">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                                        <p className="text-xs text-portalOrange mt-4 group-hover:underline">Click to change file</p>
                                                    </div>
                                                ) : (
                                                    <div className="animate-in fade-in duration-300">
                                                        <div className="mx-auto w-16 h-16 bg-blue-50 group-hover:bg-blue-100 rounded-full flex items-center justify-center transition-colors mb-4">
                                                            <Upload className="h-8 w-8 text-portalBlue" />
                                                        </div>
                                                        <div className="flex text-base justify-center">
                                                            <span className="relative font-bold text-portalBlue group-hover:text-blue-800 transition-colors">
                                                                Choose a file
                                                            </span>
                                                            <p className="pl-1 text-gray-600 font-medium">or drag and drop</p>
                                                        </div>
                                                        <p className="text-sm text-gray-500 mt-1">PDF, PNG, JPG (Max 50MB)</p>
                                                    </div>
                                                )}
                                            </div>
                                            {/* Hover gradient effect inside dropzone */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-portalBlue/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                        </div>
                                        <input
                                            id="file-upload"
                                            name="file-upload"
                                            type="file"
                                            className="sr-only"
                                            ref={fileInputRef}
                                            onChange={handleFileChange}
                                            accept=".pdf,image/*"
                                        />
                                    </div>

                                    <div className="pt-6 flex justify-end space-x-4 border-t border-gray-100">
                                        <button
                                            type="button"
                                            onClick={() => navigate('/dashboard')}
                                            className="px-6 py-3 text-sm font-bold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:text-gray-900 transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
                                            disabled={loading}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            form="upload-form"
                                            type="submit"
                                            disabled={loading || !file || !title || !branch || (branch === 'Other' && !otherBranch) || !semester || !year || !resourceType}
                                            className="flex items-center px-8 py-3 text-sm font-bold text-white bg-portalBlue rounded-xl hover:bg-blue-800 transition-all transform hover:scale-[1.02] disabled:hover:scale-100 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-portalBlue focus:ring-offset-2"
                                        >
                                            {loading ? 'Uploading...' : (
                                                <>
                                                    <Upload size={18} className="mr-2" />
                                                    Submit PYQ
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>

                    </div>
                </div>
            </main>
        </div>
    );
};

export default UploadPage;
