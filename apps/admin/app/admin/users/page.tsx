'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
    Users, UserPlus, Search, Filter, MoreHorizontal,
    Edit, Trash2, Shield, Crown, Eye, RefreshCw, Download
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { getAllUsers, updateUserRole, updateUserStatus, deleteUser, type AdminUser } from '@/actions/(admin)/admin/admin.action';
import EmptyState from '../_components/empty-state';
import { toast } from 'sonner';

export default function UsersPage() {
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('ALL');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
    const [isUserDetailOpen, setIsUserDetailOpen] = useState(false);
    const [totalCount, setTotalCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchUsers = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await getAllUsers(currentPage, 10, searchTerm, statusFilter, roleFilter);

            if (response.success) {
                setUsers(response.data?.users || []);
                setTotalCount(response.data?.totalCount || 0);
                setTotalPages(response.data?.totalPages || 1);
            } else {
                toast.error('Failed to fetch users');
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            toast.error('Failed to fetch users');
        } finally {
            setIsLoading(false);
        }
    }, [currentPage, searchTerm, roleFilter, statusFilter]);

    useEffect(() => {
        fetchUsers();
    }, [currentPage, searchTerm, roleFilter, statusFilter, fetchUsers]);

    const handleRoleUpdate = async (userId: string, newRole: 'Student' | 'Admin') => {
        try {
            const response = await updateUserRole(userId, newRole);
            if (response.success) {
                toast.success(response.message);
                fetchUsers(); // Refresh the data
            } else {
                toast.error(response.error);
            }
        } catch (error) {
            console.error('Error updating user role:', error);
            toast.error('Failed to update user role');
        }
    };

    const handleStatusUpdate = async (userId: string, newStatus: 'ACTIVE' | 'INACTIVE' | 'BANNED') => {
        try {
            const response = await updateUserStatus(userId, newStatus);
            if (response.success) {
                toast.success(response.message);
                fetchUsers();
            } else {
                toast.error(response.error);
            }
        } catch (error) {
            console.error('Error updating user status:', error);
            toast.error('Failed to update user status');
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            return;
        }

        try {
            const response = await deleteUser(userId);
            if (response.success) {
                toast.success(response.message);
                fetchUsers();
            } else {
                toast.error(response.error);
            }
        } catch (error) {
            console.error('Error deleting user:', error);
            toast.error('Failed to delete user');
        }
    };

    const showUserDetails = (user: AdminUser) => {
        setSelectedUser(user);
        setIsUserDetailOpen(true);
    };

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'Admin':
                return 'bg-red-100 text-red-800';
            case 'Student':
                return 'bg-blue-100 text-blue-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ACTIVE':
                return 'bg-green-100 text-green-800';
            case 'INACTIVE':
                return 'bg-yellow-100 text-yellow-800';
            case 'BANNED':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    if (isLoading && currentPage === 1) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">User Management</h1>
                    <p className="text-muted-foreground">
                        Manage users, their roles, and platform access across the system.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={fetchUsers} disabled={isLoading}>
                        <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                    <Button variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Export Users
                    </Button>
                </div>
            </div>
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalCount.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">Registered users</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                        <UserPlus className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{users.filter(u => u.status === 'ACTIVE').length}</div>
                        <p className="text-xs text-muted-foreground">Currently active</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Admins</CardTitle>
                        <Shield className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{users.filter(u => u.role === 'Admin').length}</div>
                        <p className="text-xs text-muted-foreground">Admin users</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">With Resume</CardTitle>
                        <Crown className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{users.filter(u => u.hasResume).length}</div>
                        <p className="text-xs text-muted-foreground">Resume uploaded</p>
                    </CardContent>
                </Card>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Filter className="h-5 w-5" />
                        Filters & Search
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by name, email, or username..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Select value={roleFilter} onValueChange={setRoleFilter}>
                            <SelectTrigger className="w-full md:w-[180px]">
                                <SelectValue placeholder="Role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All Roles</SelectItem>
                                <SelectItem value="Student">Student</SelectItem>
                                <SelectItem value="Admin">Admin</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-full md:w-[180px]">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All Status</SelectItem>
                                <SelectItem value="ACTIVE">Active</SelectItem>
                                <SelectItem value="INACTIVE">Inactive</SelectItem>
                                <SelectItem value="BANNED">Banned</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Users ({totalCount})</CardTitle>
                    <CardDescription>
                        Manage user accounts and permissions
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {
                        users.length > 0 ? (
                            <>
                                <Table>
                                    <TableHeader>
                                    <TableRow>
                                            <TableHead>User</TableHead>
                                            <TableHead>Role</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Credits</TableHead>
                                            <TableHead>Level</TableHead>
                                            <TableHead>Challenges</TableHead>
                                            <TableHead>Joined</TableHead>
                                            <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {
                                            users.map((user) => (
                                                <TableRow key={user.id}>
                                                    <TableCell>
                                                        <div className="flex items-center gap-3">
                                                            <Avatar className="h-8 w-8">
                                                                <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-bold">
                                                                    {user.name?.slice(0, 2)?.toUpperCase() || 'U'}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div>
                                                                <div className="font-medium">{user.name || 'Unknown'}</div>
                                                                <div className="text-sm text-muted-foreground">{user.email}</div>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge className={getRoleColor(user.role)}>
                                                            {user.role}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge className={getStatusColor(user.status)}>
                                                            {user.status}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>{user.credits}</TableCell>
                                                    <TableCell>{user.level}</TableCell>
                                                    <TableCell>
                                                        <div className="text-sm">
                                                            {user.completedChallenges}/{user.totalChallenges}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-sm text-muted-foreground">
                                                        {new Date(user.joinedAt).toLocaleDateString()}
                                                    </TableCell>
                                                <TableCell>
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                                    <MoreHorizontal className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                                <DropdownMenuItem onClick={() => showUserDetails(user)}>
                                                                    <Eye className="mr-2 h-4 w-4" />
                                                                    View Details
                                                                </DropdownMenuItem>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem
                                                                    onClick={() => handleRoleUpdate(user.id, user.role === 'Admin' ? 'Student' : 'Admin')}
                                                                >
                                                                    <Shield className="mr-2 h-4 w-4" />
                                                                    {user.role === 'Admin' ? 'Make Student' : 'Make Admin'}
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem
                                                                    onClick={() => handleStatusUpdate(user.id, user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE')}
                                                                >
                                                                    <Edit className="mr-2 h-4 w-4" />
                                                                    {user.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                                                                </DropdownMenuItem>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem
                                                                    className="text-red-600"
                                                                    onClick={() => handleDeleteUser(user.id)}
                                                                >
                                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                                    Delete User
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    }
                                </TableBody>
                            </Table>
                                {
                                    totalPages > 1 && (
                                        <div className="flex items-center justify-between pt-4">
                                            <div className="text-sm text-muted-foreground">
                                                Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, totalCount)} of {totalCount} users
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                                    disabled={currentPage === 1}
                                                >
                                                    Previous
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                                    disabled={currentPage === totalPages}
                                                >
                                                    Next
                                                </Button>
                                            </div>
                                        </div>
                                    )
                                }
                            </>
                        ) : (
                            <EmptyState
                                icon={Users}
                                title="No Users Found"
                                description="No users match your current search and filter criteria. Try adjusting your filters or search term."
                                actionText="Clear Filters"
                                onAction={() => {
                                    setSearchTerm('');
                                    setRoleFilter('ALL');
                                    setStatusFilter('ALL');
                                }}
                            />
                        )
                    }
                </CardContent>
            </Card>
            <Dialog open={isUserDetailOpen} onOpenChange={setIsUserDetailOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>User Details</DialogTitle>
                        <DialogDescription>
                            Complete information about {selectedUser?.name}
                        </DialogDescription>
                    </DialogHeader>
                    {
                        selectedUser && (
                            <div className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <Avatar className="h-16 w-16">
                                        <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-lg font-bold">
                                            {selectedUser.name?.slice(0, 2)?.toUpperCase() || 'U'}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <h3 className="text-lg font-semibold">{selectedUser.name || 'Unknown User'}</h3>
                                        <p className="text-muted-foreground">{selectedUser.email}</p>
                                        <div className="flex gap-2 mt-2">
                                            <Badge className={getRoleColor(selectedUser.role)}>{selectedUser.role}</Badge>
                                            <Badge className={getStatusColor(selectedUser.status)}>{selectedUser.status}</Badge>
                                            {selectedUser.hasResume && <Badge variant="outline">Resume Uploaded</Badge>}
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <h4 className="font-medium mb-2">Account Information</h4>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">User ID:</span>
                                                <span className="font-mono">{selectedUser.id}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Joined:</span>
                                                <span>{new Date(selectedUser.joinedAt).toLocaleDateString()}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Last Active:</span>
                                                <span>{new Date(selectedUser.lastActive).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="font-medium mb-2">Platform Stats</h4>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Credits:</span>
                                                <span className="font-semibold">{selectedUser.credits}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">XP:</span>
                                                <span>{selectedUser.xp.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Level:</span>
                                                <span>{selectedUser.level}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Challenges:</span>
                                                <span>{selectedUser.completedChallenges}/{selectedUser.totalChallenges}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
                </DialogContent>
            </Dialog>
        </div>
    );
}