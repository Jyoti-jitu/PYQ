import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    BookOpen, FileText, Bookmark, Clock, Upload, LogOut, UserCircle,
    ChevronRight, Mail, Phone, GraduationCap, Calendar, Edit2, Shield,
    CheckCircle, Search
} from 'lucide-react';

const ProfilePage = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    useEffect(() => {
        const loggedInUser = localStorage.getItem('user');
        if (loggedInUser) {
            setUser(JSON.parse(loggedInUser));
        } else {
            navigate('/login');
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/login');
    };

    if (!user) return null;

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
                    <button onClick={() => navigate('/upload')} className="flex items-center space-x-3 px-4 py-3 text-gray-600 hover:bg-gray-50 hover:text-portalBlue rounded-lg font-medium transition-colors w-full text-left">
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
                        <span className="text-gray-900">Student Profile</span>
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
                        <button className="text-portalBlue transition-colors">
                            <UserCircle size={28} />
                        </button>
                    </div>
                </header>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-auto p-6 sm:p-8 relative z-10">
                    <div className="max-w-4xl mx-auto space-y-8">

                        {/* Profile Header Card */}
                        <div className="bg-white/70 backdrop-blur-lg rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/80 p-8 sm:p-10 flex flex-col md:flex-row items-center md:items-start gap-8 relative overflow-hidden">
                            {/* Decorative element */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-portalBlue/5 rounded-bl-[100px] pointer-events-none"></div>

                            <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-portalBlue to-blue-400 p-1 flex-shrink-0 shadow-lg">
                                <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-portalBlue overflow-hidden">
                                    <UserCircle size={100} strokeWidth={1} className="text-portalBlue/20 scale-125" />
                                </div>
                            </div>

                            <div className="flex-1 text-center md:text-left z-10">
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">{user.full_name}</h1>
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-6">
                                    <span className="px-3 py-1 bg-blue-50 text-portalBlue text-sm font-semibold rounded-full border border-blue-100 flex items-center shadow-sm">
                                        <GraduationCap size={16} className="mr-1.5" />
                                        {user.branch || 'General'}
                                    </span>
                                    <span className="px-3 py-1 bg-orange-50 text-portalOrange text-sm font-semibold rounded-full border border-orange-100 flex items-center shadow-sm">
                                        <Shield size={16} className="mr-1.5" />
                                        Roll: {user.roll_number}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Profile Details Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                            {/* Personal Information */}
                            <div className="bg-white/70 backdrop-blur-lg rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/80 p-8 relative">
                                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                                    <UserCircle className="text-portalBlue mr-3" size={24} />
                                    Personal details
                                </h2>

                                <div className="space-y-6">
                                    <div className="flex items-start">
                                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-portalBlue mr-4 flex-shrink-0">
                                            <Mail size={20} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-500 mb-0.5">Email Address</p>
                                            <p className="text-gray-900 font-medium">{user.email}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start">
                                        <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-portalOrange mr-4 flex-shrink-0">
                                            <Phone size={20} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-500 mb-0.5">Phone Number</p>
                                            <p className="text-gray-900 font-medium">{user.phone || 'Not Provided'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Academic Information */}
                            <div className="bg-white/70 backdrop-blur-lg rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/80 p-8 relative">
                                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                                    <GraduationCap className="text-portalBlue mr-3" size={24} />
                                    Academic details
                                </h2>

                                <div className="space-y-6">
                                    <div className="flex items-start">
                                        <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-portalOrange mr-4 flex-shrink-0">
                                            <BookOpen size={20} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-500 mb-0.5">Branch / Department</p>
                                            <p className="text-gray-900 font-medium">{user.branch}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start">
                                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-portalBlue mr-4 flex-shrink-0">
                                            <Calendar size={20} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-500 mb-0.5">Current Semester</p>
                                            <p className="text-gray-900 font-medium">{user.semester || 'Not Set'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </main>
        </div>
    );
};

export default ProfilePage;
