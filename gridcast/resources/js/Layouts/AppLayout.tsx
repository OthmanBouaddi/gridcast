import React, { useState } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import { PageProps, Role } from '@/types';
import {
    LayoutDashboard,
    Calendar,
    Tv,
    PlusCircle,
    CheckSquare,
    DollarSign,
    Bell,
    LogOut,
    User as UserIcon,
    Menu,
    X,
    CheckCheck,
} from 'lucide-react';
import ChatWidget from '@/Components/ChatWidget';

interface Props {
    title?: string;
    children: React.ReactNode;
}

export default function AppLayout({ title, children }: Props) {
    const { auth, flash } = usePage<PageProps>().props;
    const user = auth.user;
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loadingNotifications, setLoadingNotifications] = useState(false);

    const roleColors: Record<Role, { bg: string; text: string; label: string }> = {
        admin: { bg: 'bg-purple-100 text-purple-800 border-purple-200', text: 'text-purple-700', label: 'Administrateur' },
        programmation: { bg: 'bg-blue-100 text-blue-800 border-blue-200', text: 'text-blue-700', label: 'Programmation' },
        producteur: { bg: 'bg-emerald-100 text-emerald-800 border-emerald-200', text: 'text-emerald-700', label: 'Producteur' },
        regie: { bg: 'bg-amber-100 text-amber-800 border-amber-200', text: 'text-amber-700', label: 'Régie Pub' },
    };

    const navItems = [
        {
            name: 'Tableau de bord',
            href: route('dashboard'),
            icon: LayoutDashboard,
            roles: ['admin', 'programmation', 'producteur', 'regie'] as Role[],
            current: route().current('dashboard'),
        },
        {
            name: 'Grille de programmes',
            href: route('schedule.index'),
            icon: Calendar,
            roles: ['admin', 'programmation', 'producteur', 'regie'] as Role[],
            current: route().current('schedule.*'),
        },
        {
            name: 'Catalogue de programmes',
            href: route('programs.index'),
            icon: Tv,
            roles: ['admin', 'programmation', 'producteur', 'regie'] as Role[],
            current: route().current('programs.index') || route().current('programs.show'),
        },
        {
            name: 'Nouveau programme',
            href: route('programs.create'),
            icon: PlusCircle,
            roles: ['admin', 'producteur'] as Role[],
            current: route().current('programs.create'),
        },
        {
            name: 'File de validation',
            href: route('validation.index'),
            icon: CheckSquare,
            roles: ['admin', 'programmation'] as Role[],
            current: route().current('validation.*'),
        },
        {
            name: 'Régie publicitaire',
            href: route('advertising.index'),
            icon: DollarSign,
            roles: ['admin', 'regie'] as Role[],
            current: route().current('advertising.*'),
        },
    ];

    const allowedNav = navItems.filter((item) => item.roles.includes(user.role));

    const loadNotifications = async () => {
        if (!notificationsOpen) {
            setLoadingNotifications(true);
            try {
                const res = await fetch(route('notifications.index'));
                const data = await res.json();
                setNotifications(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoadingNotifications(false);
            }
        }
        setNotificationsOpen(!notificationsOpen);
    };

    const markAsRead = async (id: string) => {
        try {
            await router.post(route('notifications.read', id), {}, { preserveScroll: true });
            setNotifications(notifications.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n)));
        } catch (err) {
            console.error(err);
        }
    };

    const markAllAsRead = async () => {
        try {
            await router.post(route('notifications.readAll'), {}, { preserveScroll: true });
            setNotifications(notifications.map((n) => ({ ...n, read_at: new Date().toISOString() })));
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <>
        <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row text-slate-900 font-sans">
            {/* Mobile Header */}
            <div className="md:hidden flex items-center justify-between bg-slate-900 text-white p-4">
                <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center font-bold text-white text-lg">
                        G
                    </div>
                    <span className="font-semibold tracking-wide">GridCast TV</span>
                </div>
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="p-1 rounded text-slate-300 hover:text-white focus:outline-none"
                >
                    {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-slate-300 flex flex-col transition-transform duration-200 ease-in-out md:static md:translate-x-0 ${
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                {/* Brand */}
                <div className="p-5 border-b border-slate-800 flex items-center space-x-3">
                    <div className="w-9 h-9 rounded bg-blue-600 flex items-center justify-center font-bold text-white text-xl shadow-md">
                        G
                    </div>
                    <div>
                        <h1 className="font-bold text-white text-lg tracking-tight">GridCast</h1>
                        <p className="text-xs text-slate-400">Diffusion Télévisée Maroc</p>
                    </div>
                </div>

                {/* User Role Card */}
                <div className="p-4 mx-3 my-3 bg-slate-800/70 rounded-lg border border-slate-700/60">
                    <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Session active</div>
                    <div className="text-sm font-medium text-white truncate mt-0.5">{user.name}</div>
                    <div className="mt-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border bg-slate-900 text-slate-200 border-slate-700">
                        <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-blue-500"></span>
                        {roleColors[user.role]?.label || user.role}
                    </div>
                </div>

                {/* Nav Links */}
                <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
                    {allowedNav.map((item) => {
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                                    item.current
                                        ? 'bg-blue-600 text-white font-semibold shadow-sm'
                                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                                }`}
                            >
                                <Icon className="w-5 h-5 mr-3 flex-shrink-0" />
                                <span>{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Bottom section */}
                <div className="p-4 border-t border-slate-800 space-y-2">
                    <Link
                        href={route('profile.edit')}
                        className="flex items-center px-3 py-2 text-sm rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    >
                        <UserIcon className="w-4 h-4 mr-3" />
                        <span>Mon Profil</span>
                    </Link>
                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className="w-full flex items-center px-3 py-2 text-sm rounded-md text-red-400 hover:text-red-300 hover:bg-slate-800 transition-colors"
                    >
                        <LogOut className="w-4 h-4 mr-3" />
                        <span>Déconnexion</span>
                    </Link>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
                {/* Topbar */}
                <header className="bg-white border-b border-slate-200 px-6 py-3.5 flex items-center justify-between sticky top-0 z-20">
                    <div className="flex items-center space-x-3">
                        <h2 className="text-xl font-bold text-slate-800 tracking-tight">{title || 'Gestion GridCast'}</h2>
                    </div>

                    <div className="flex items-center space-x-4">
                        {/* Notifications Bell */}
                        <div className="relative">
                            <button
                                onClick={loadNotifications}
                                className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-full focus:outline-none transition-colors"
                                title="Notifications"
                            >
                                <Bell className="w-5 h-5" />
                                {user.unread_notifications_count && user.unread_notifications_count > 0 ? (
                                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                                        {user.unread_notifications_count}
                                    </span>
                                ) : null}
                            </button>

                            {/* Notifications Popup */}
                            {notificationsOpen && (
                                <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white rounded-lg shadow-xl border border-slate-200 py-2 z-50">
                                    <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                                        <span className="font-semibold text-sm text-slate-800">Notifications</span>
                                        <button
                                            onClick={markAllAsRead}
                                            className="text-xs text-blue-600 hover:text-blue-800 flex items-center"
                                        >
                                            <CheckCheck className="w-3.5 h-3.5 mr-1" />
                                            Tout marquer comme lu
                                        </button>
                                    </div>
                                    <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                                        {loadingNotifications ? (
                                            <div className="p-4 text-center text-xs text-slate-500">Chargement...</div>
                                        ) : notifications.length === 0 ? (
                                            <div className="p-4 text-center text-xs text-slate-500">
                                                Aucune notification pour le moment.
                                            </div>
                                        ) : (
                                            notifications.map((n) => (
                                                <div
                                                    key={n.id}
                                                    className={`p-3 text-xs flex justify-between items-start ${
                                                        !n.read_at ? 'bg-blue-50/60' : 'bg-white'
                                                    }`}
                                                >
                                                    <div className="flex-1 pr-2">
                                                        <p className="font-medium text-slate-800">{n.data?.message}</p>
                                                        <span className="text-[10px] text-slate-400 mt-1 block">
                                                            {new Date(n.created_at).toLocaleString('fr-FR')}
                                                        </span>
                                                    </div>
                                                    {!n.read_at && (
                                                        <button
                                                            onClick={() => markAsRead(n.id)}
                                                            className="text-blue-600 hover:text-blue-800 text-[11px] whitespace-nowrap"
                                                        >
                                                            Marquer lu
                                                        </button>
                                                    )}
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* User pill */}
                        <div className="hidden sm:flex items-center space-x-2 pl-2 border-l border-slate-200">
                            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-700 text-sm">
                                {user.name.charAt(0)}
                            </div>
                            <div className="text-left text-xs">
                                <div className="font-semibold text-slate-800">{user.name}</div>
                                <div className="text-slate-500 capitalize">{user.role}</div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Flash Messages */}
                {flash?.success && (
                    <div className="mx-6 mt-4 p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center justify-between shadow-sm">
                        <span>{flash.success}</span>
                    </div>
                )}
                {flash?.error && (
                    <div className="mx-6 mt-4 p-4 rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm flex items-center justify-between shadow-sm">
                        <span>{flash.error}</span>
                    </div>
                )}

                {/* Page Content */}
                <main className="p-6 flex-1">{children}</main>
            </div>
        </div>

        {/* AI Chatbot – available on every authenticated page */}
        <ChatWidget />
        </>
    );
}
