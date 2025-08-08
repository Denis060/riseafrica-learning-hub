
import React, { useState, useEffect, useContext, useMemo } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Users, Shield, School, UserCheck, Search, Edit, Trash2, X } from 'lucide-react';

const EditUserModal = ({ user, onClose, onSave }) => {
    const [editedUser, setEditedUser] = useState(user);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditedUser({ ...editedUser, [name]: value });
    };

    const handleSave = () => {
        onSave(editedUser);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-[#0A2463]">Edit User</h2>
                    <button onClick={onClose}><X /></button>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Name</label>
                        <input type="text" name="name" value={editedUser.name} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input type="email" name="email" value={editedUser.email} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Role</label>
                        <select name="role" value={editedUser.role} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm">
                            <option value="student">Student</option>
                            <option value="tutor">Tutor</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Status</label>
                        <select name="status" value={editedUser.status} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm">
                            <option value="active">Active</option>
                            <option value="suspended">Suspended</option>
                        </select>
                    </div>
                </div>
                <div className="mt-8 flex justify-end gap-4">
                    <button onClick={onClose} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg">Cancel</button>
                    <button onClick={handleSave} className="bg-[#0A2463] text-white font-bold py-2 px-4 rounded-lg">Save Changes</button>
                </div>
            </div>
        </div>
    );
};

const AdminUsersPage = () => {
    const { user: adminUser } = useContext(AuthContext);
    const [allUsers, setAllUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    const fetchUsers = async () => {
        try {
            setIsLoading(true);
            const response = await fetch('http://localhost/riseafrica-hub/backend/api/getUsers.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ admin_id: adminUser.id }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to fetch users.');
            setAllUsers(data.records || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (adminUser && adminUser.role === 'admin') {
            fetchUsers();
        }
    }, [adminUser]);

    const handleEdit = (userToEdit) => {
        setSelectedUser(userToEdit);
        setIsModalOpen(true);
    };

    const handleDelete = async (userIdToDelete) => {
        if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            try {
                const response = await fetch('http://localhost/riseafrica-hub/backend/api/deleteUser.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ admin_id: adminUser.id, user_id_to_delete: userIdToDelete }),
                });
                const data = await response.json();
                if (!response.ok) throw new Error(data.message);
                alert('User deleted successfully.');
                fetchUsers();
            } catch (err) {
                alert(`Error: ${err.message}`);
            }
        }
    };

    const handleSaveUser = async (userToUpdate) => {
        try {
            const response = await fetch('http://localhost/riseafrica-hub/backend/api/updateUser.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ admin_id: adminUser.id, user_to_update: userToUpdate }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message);
            alert('User updated successfully.');
            setIsModalOpen(false);
            fetchUsers();
        } catch (err) {
            alert(`Error: ${err.message}`);
        }
    };

    const filteredUsers = useMemo(() => {
        return allUsers.filter(u => {
            const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesFilter = roleFilter === 'all' || u.role === roleFilter;
            return matchesSearch && matchesFilter;
        });
    }, [allUsers, searchTerm, roleFilter]);

    const RoleIcon = ({ role }) => {
        switch (role) {
            case 'admin': return <Shield size={16} className="text-red-500" />;
            case 'tutor': return <School size={16} className="text-blue-500" />;
            default: return <UserCheck size={16} className="text-green-500" />;
        }
    };

    if (isLoading) return <div className="text-center p-10">Loading users...</div>;
    if (error) return <div className="text-center p-10 text-red-500">Error: {error}</div>;

    return (
        <>
            {isModalOpen && <EditUserModal user={selectedUser} onClose={() => setIsModalOpen(false)} onSave={handleSaveUser} />}
            <div>
                <h1 className="text-3xl font-black text-[#0A2463] mb-8 flex items-center"><Users className="mr-3" /> User Management</h1>
                <div className="mb-6 p-4 bg-white rounded-lg shadow-sm flex flex-col md:flex-row gap-4">
                    <div className="relative flex-grow">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input type="text" placeholder="Search by name or email..." className="w-full pl-10 pr-4 py-2 border rounded-lg" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>
                    <div className="flex-shrink-0">
                        <select className="w-full md:w-auto px-4 py-2 border rounded-lg bg-white" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                            <option value="all">All Roles</option>
                            <option value="admin">Admin</option>
                            <option value="tutor">Tutor</option>
                            <option value="student">Student</option>
                        </select>
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow-md overflow-x-auto">
                    <table className="min-w-full leading-normal">
                        <thead>
                            <tr>
                                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Role</th>
                                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.length > 0 ? filteredUsers.map((u) => (
                                <tr key={u.id} className="hover:bg-gray-50">
                                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{u.name}</td>
                                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{u.email}</td>
                                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm capitalize">{u.role}</td>
                                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${u.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {u.status}
                                        </span>
                                    </td>
                                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                        <div className="flex gap-4">
                                            <button onClick={() => handleEdit(u)} className="text-blue-600 hover:text-blue-900"><Edit size={18} /></button>
                                            <button onClick={() => handleDelete(u.id)} className="text-red-600 hover:text-red-900"><Trash2 size={18} /></button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" className="text-center py-10 text-gray-500">No users found matching your criteria.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
};

export default AdminUsersPage;