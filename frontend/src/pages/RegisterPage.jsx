import React, { useState } from 'react';
import axios from 'axios';
import { BookOpen, AlertCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const RegisterPage = () => {
    const [regName, setRegName] = useState('');
    const [regRollNumber, setRegRollNumber] = useState('');
    const [regPhone, setRegPhone] = useState('');
    const [regEmail, setRegEmail] = useState('');
    const [regBranch, setRegBranch] = useState('');
    const [customBranch, setCustomBranch] = useState('');
    const [regSemester, setRegSemester] = useState('');
    const [regPassword, setRegPassword] = useState('');
    const [agreed, setAgreed] = useState(false);

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);

    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setMessage('');
        setIsError(false);

        if (!agreed) {
            setIsError(true);
            setMessage('You must agree to the terms to register.');
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/register`, {
                email: regEmail,
                password: regPassword,
                fullName: regName,
                rollNumber: regRollNumber,
                phone: regPhone,
                branch: regBranch === 'Other' ? customBranch : regBranch,
                semester: regSemester
            });
            setMessage('Registration successful! Redirecting to login...');
            console.log('Register Response:', response.data);

            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setIsError(true);
            setMessage(err.response?.data?.error || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-portalBgLight bg-gradient-to-br from-white to-gray-200 flex flex-col pt-8 sm:pt-16 pb-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-lg mx-auto w-full mb-8 px-4 text-center">
                <div className="flex items-center justify-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-portalBlue rounded-full flex items-center justify-center text-white shadow-md">
                        <BookOpen size={24} />
                    </div>
                    <h2 className="text-2xl font-bold text-portalBlue tracking-tight uppercase">GITA College</h2>
                </div>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-portalBlue mb-2">GITA College PYQ Portal</h1>
                <p className="text-portalTextGray text-base sm:text-lg">Create a new student account</p>

                {message && (
                    <div className={`mt-6 p-4 rounded-md flex items-center shadow-sm w-full mx-auto ${isError ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
                        {isError && <AlertCircle size={20} className="mr-2" />}
                        <span className="font-medium text-left">{message}</span>
                    </div>
                )}
            </div>

            <div className="max-w-lg mx-auto w-full px-4">
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
                    <h3 className="text-2xl font-bold text-portalBlue border-b-2 border-gray-100 pb-4 mb-6 text-center">
                        New Student Registration
                    </h3>

                    <form onSubmit={handleRegister} className="space-y-4">
                        <div>
                            <input
                                type="text"
                                className="block w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-portalBlue transition-colors sm:text-sm"
                                placeholder="Full Name"
                                value={regName}
                                onChange={(e) => setRegName(e.target.value)}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <input
                                type="text"
                                className="block w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-portalBlue transition-colors sm:text-sm"
                                placeholder="Roll Number"
                                value={regRollNumber}
                                onChange={(e) => setRegRollNumber(e.target.value)}
                                required
                            />
                            <input
                                type="text"
                                className="block w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-portalBlue transition-colors sm:text-sm"
                                placeholder="Phone No."
                                value={regPhone}
                                onChange={(e) => setRegPhone(e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <input
                                type="email"
                                className="block w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-portalBlue transition-colors sm:text-sm"
                                placeholder="Email Address"
                                value={regEmail}
                                onChange={(e) => setRegEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <select
                                className="block w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-portalBlue transition-colors sm:text-sm"
                                value={regBranch}
                                onChange={(e) => setRegBranch(e.target.value)}
                                required
                            >
                                <option value="" disabled>Select Branch</option>
                                <option value="CSE">CSE</option>
                                <option value="IT">IT</option>
                                <option value="ECE">ECE</option>
                                <option value="EE">EE</option>
                                <option value="ME">ME</option>
                                <option value="CE">CE</option>
                                <option value="Other">Other (Please Specify)</option>
                            </select>
                            <select
                                className="block w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-portalBlue transition-colors sm:text-sm"
                                value={regSemester}
                                onChange={(e) => setRegSemester(e.target.value)}
                                required
                            >
                                <option value="" disabled>Semester</option>
                                <option value="1">1st Sem</option>
                                <option value="2">2nd Sem</option>
                                <option value="3">3rd Sem</option>
                                <option value="4">4th Sem</option>
                                <option value="5">5th Sem</option>
                                <option value="6">6th Sem</option>
                                <option value="7">7th Sem</option>
                                <option value="8">8th Sem</option>
                            </select>
                        </div>

                        {regBranch === 'Other' && (
                            <div>
                                <input
                                    type="text"
                                    className="block w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-portalBlue transition-colors sm:text-sm"
                                    placeholder="Enter your custom branch name"
                                    value={customBranch}
                                    onChange={(e) => setCustomBranch(e.target.value)}
                                    required
                                />
                            </div>
                        )}

                        <div>
                            <input
                                type="password"
                                className="block w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-portalBlue transition-colors sm:text-sm"
                                placeholder="Create Password"
                                value={regPassword}
                                onChange={(e) => setRegPassword(e.target.value)}
                                required
                                minLength={6}
                            />
                        </div>

                        <div className="flex items-center pt-2 pb-4">
                            <input
                                id="terms"
                                type="checkbox"
                                className="h-4 w-4 text-portalBlue focus:ring-portalBlue border-gray-300 rounded cursor-pointer"
                                checked={agreed}
                                onChange={(e) => setAgreed(e.target.checked)}
                            />
                            <label htmlFor="terms" className="ml-2 block text-sm text-gray-700 cursor-pointer select-none">
                                I agree to the <a href="#" className="text-portalBlue hover:underline">Terms and Conditions</a>
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-lg shadow-sm text-lg font-medium text-white bg-portalOrange hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-portalOrange transition-colors disabled:opacity-70"
                        >
                            {loading ? 'Please wait...' : 'Register'}
                        </button>
                    </form>

                    <div className="mt-6 text-center text-sm">
                        <span className="text-gray-600">Already have an account? </span>
                        <Link to="/login" className="font-medium text-portalBlue hover:text-blue-800 transition-colors">
                            Login here
                        </Link>
                    </div>
                </div>
            </div>

            <div className="mt-auto pt-8 text-center text-sm text-gray-500">
                &copy; {new Date().getFullYear()} GITA College. All rights reserved.
            </div>
        </div>
    );
};

export default RegisterPage;
