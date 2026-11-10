import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { PageProps } from '@/types';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend,
} from 'recharts';
import { Tv, CheckCircle, TrendingUp, Calendar, AlertCircle } from 'lucide-react';

interface MetricData {
    totalPrograms: number;
    validationRate: number;
    submittedCount: number;
    validatedCount: number;
    totalAdRevenue: number;
    projectedAdRevenue: number;
    activeSlotsCount: number;
}

interface CategoryDist {
    name: string;
    count: number;
    color: string;
}

interface StatusItem {
    name: string;
    value: number;
    color: string;
}

interface AudienceZone {
    channel_zone: string;
    avg_audience: number;
    reports_count: number;
}

interface DashboardProps extends PageProps {
    metrics: MetricData;
    categoryDistribution: CategoryDist[];
    statusBreakdown: StatusItem[];
    audienceByZone: AudienceZone[];
    upcomingSlots: any[];
    recentNotifications: any[];
}

export default function Dashboard({
    metrics,
    categoryDistribution,
    statusBreakdown,
    audienceByZone,
    upcomingSlots,
}: DashboardProps) {
    const formattedRevenue = new Intl.NumberFormat('fr-MA', {
        style: 'currency',
        currency: 'MAD',
        maximumFractionDigits: 0,
    }).format(metrics.totalAdRevenue);

    return (
        <AppLayout title="Tableau de bord de diffusion">
            <Head title="Tableau de bord" />

            <div className="space-y-6">
                {/* Metric Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Catalogue</p>
                            <h3 className="text-2xl font-bold text-slate-800 mt-1">{metrics.totalPrograms}</h3>
                            <span className="text-xs text-blue-600 font-medium">{metrics.validatedCount} validés pour diffusion</span>
                        </div>
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                            <Tv className="w-6 h-6" />
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Taux de validation</p>
                            <h3 className="text-2xl font-bold text-slate-800 mt-1">{metrics.validationRate}%</h3>
                            <span className="text-xs text-amber-600 font-medium">{metrics.submittedCount} en attente de revue</span>
                        </div>
                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
                            <CheckCircle className="w-6 h-6" />
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Chiffre d'Affaires Pub</p>
                            <h3 className="text-2xl font-bold text-slate-800 mt-1">{formattedRevenue}</h3>
                            <span className="text-xs text-slate-500 font-medium">Spots diffusés</span>
                        </div>
                        <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Grille hebdomadaire</p>
                            <h3 className="text-2xl font-bold text-slate-800 mt-1">{metrics.activeSlotsCount}</h3>
                            <span className="text-xs text-slate-500 font-medium">Créneaux programmés</span>
                        </div>
                        <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
                            <Calendar className="w-6 h-6" />
                        </div>
                    </div>
                </div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Chart 1: Répartition des programmes par catégorie */}
                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="font-bold text-slate-800 text-sm">Répartition des programmes par catégorie</h4>
                            <span className="text-xs text-slate-400">Total: {metrics.totalPrograms}</span>
                        </div>
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={categoryDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis
                                        dataKey="name"
                                        tick={{ fontSize: 10 }}
                                        interval={0}
                                        angle={-20}
                                        textAnchor="end"
                                    />
                                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                                    />
                                    <Bar dataKey="count" name="Nombre" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                                        {categoryDistribution.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color || '#3b82f6'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Chart 2: Taux et statuts de validation */}
                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="font-bold text-slate-800 text-sm">État du workflow des programmes</h4>
                            <span className="text-xs font-semibold text-emerald-600">Taux validation: {metrics.validationRate}%</span>
                        </div>
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={statusBreakdown}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={55}
                                        outerRadius={80}
                                        paddingAngle={4}
                                    >
                                        {statusBreakdown.map((entry, index) => (
                                            <Cell key={`cell-status-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
                                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Chart 3: Audience moyenne par tranche horaire */}
                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm lg:col-span-2">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h4 className="font-bold text-slate-800 text-sm">Audience moyenne par tranche horaire (Téléspectateurs)</h4>
                                <p className="text-xs text-slate-500">Données issues des rapports d'audience Médiamétrie / CIAUMED</p>
                            </div>
                        </div>
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={audienceByZone} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="channel_zone" tick={{ fontSize: 12 }} />
                                    <YAxis
                                        tick={{ fontSize: 11 }}
                                        tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`}
                                    />
                                    <Tooltip
                                        formatter={(value: any) => [new Intl.NumberFormat('fr-FR').format(Number(value)) + ' téléspectateurs', 'Audience moyenne']}
                                        contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                                    />
                                    <Bar dataKey="avg_audience" name="Audience moyenne" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Bottom Row: Upcoming broadcast slots & Quick Actions */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Upcoming Broadcasts */}
                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm lg:col-span-2">
                        <div className="flex items-center justify-between mb-3">
                            <h4 className="font-bold text-slate-800 text-sm">Prochaines diffusions à l'antenne</h4>
                            <Link href={route('schedule.index')} className="text-xs text-blue-600 hover:underline">
                                Voir la grille complète →
                            </Link>
                        </div>
                        <div className="divide-y divide-slate-100">
                            {upcomingSlots.length === 0 ? (
                                <p className="text-xs text-slate-500 py-3">Aucun créneau programmé prochainement.</p>
                            ) : (
                                upcomingSlots.map((slot) => (
                                    <div key={slot.id} className="py-2.5 flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <span
                                                className="w-2.5 h-2.5 rounded-full"
                                                style={{ backgroundColor: slot.program?.category?.color || '#94a3b8' }}
                                            ></span>
                                            <div>
                                                <p className="text-sm font-semibold text-slate-800">
                                                    {slot.slot_type === 'pub' ? slot.title || 'Tunnel Publicitaire' : slot.program?.title || slot.title}
                                                </p>
                                                <div className="text-xs text-slate-500 flex items-center space-x-2">
                                                    <span>{slot.channel_zone}</span>
                                                    <span>•</span>
                                                    <span>{new Date(slot.start_datetime).toLocaleDateString('fr-FR', { weekday: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <span className="text-xs px-2 py-0.5 rounded font-medium bg-slate-100 text-slate-700">
                                            {slot.slot_type === 'pub' ? 'Publicité' : 'Émission'}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Operational Quick Actions */}
                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
                        <h4 className="font-bold text-slate-800 text-sm">Accès rapide</h4>
                        <div className="space-y-2">
                            <Link
                                href={route('schedule.index')}
                                className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-blue-50/40 text-slate-700 transition"
                            >
                                <span className="text-xs font-semibold">Grille des programmes</span>
                                <Calendar className="w-4 h-4 text-blue-600" />
                            </Link>

                            <Link
                                href={route('programs.create')}
                                className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/40 text-slate-700 transition"
                            >
                                <span className="text-xs font-semibold">Proposer un programme</span>
                                <Tv className="w-4 h-4 text-emerald-600" />
                            </Link>

                            <Link
                                href={route('advertising.index')}
                                className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-amber-400 hover:bg-amber-50/40 text-slate-700 transition"
                            >
                                <span className="text-xs font-semibold">Régie publicitaire</span>
                                <TrendingUp className="w-4 h-4 text-amber-600" />
                            </Link>

                            {metrics.submittedCount > 0 && (
                                <Link
                                    href={route('validation.index')}
                                    className="w-full flex items-center justify-between p-3 rounded-lg border border-amber-300 bg-amber-50/60 text-amber-900 transition"
                                >
                                    <div className="flex items-center space-x-2">
                                        <AlertCircle className="w-4 h-4 text-amber-600" />
                                        <span className="text-xs font-semibold">{metrics.submittedCount} programmes à valider</span>
                                    </div>
                                    <span className="text-xs font-bold text-amber-700">Examiner →</span>
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
