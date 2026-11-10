import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Category, Program, PageProps } from '@/types';
import { Search, Plus, Tv, Eye, Edit3, Clock, AlertCircle } from 'lucide-react';

interface Paginated<T> {
    data: T[];
    links: { url: string | null; label: string; active: boolean }[];
    total: number;
    current_page: number;
    last_page: number;
}

interface Props extends PageProps {
    programs: Paginated<Program>;
    categories: Category[];
    filters: {
        search?: string;
        category_id?: string;
        language?: string;
        status?: string;
    };
}

export default function ProgramsIndex({ programs, categories, filters, auth }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [categoryId, setCategoryId] = useState(filters.category_id || '');
    const [language, setLanguage] = useState(filters.language || '');
    const [status, setStatus] = useState(filters.status || '');

    const applyFilters = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        router.get(
            route('programs.index'),
            {
                search: search || undefined,
                category_id: categoryId || undefined,
                language: language || undefined,
                status: status || undefined,
            },
            { preserveState: true }
        );
    };

    const resetFilters = () => {
        setSearch('');
        setCategoryId('');
        setLanguage('');
        setStatus('');
        router.get(route('programs.index'));
    };

    const statusBadges: Record<string, { bg: string; text: string; label: string }> = {
        brouillon: { bg: 'bg-slate-100 border-slate-200', text: 'text-slate-700', label: 'Brouillon' },
        soumis: { bg: 'bg-amber-100 border-amber-200', text: 'text-amber-800', label: 'En validation' },
        valide: { bg: 'bg-emerald-100 border-emerald-200', text: 'text-emerald-800', label: 'Validé' },
        rejete: { bg: 'bg-red-100 border-red-200', text: 'text-red-800', label: 'Rejeté' },
    };

    const langLabels: Record<string, string> = {
        ar: 'Arabe (العربية)',
        fr: 'Français',
        darija: 'Darija (الدارجة)',
    };

    const isProducer = auth.user.role === 'producteur';

    return (
        <AppLayout title="Catalogue des programmes">
            <Head title="Catalogue des programmes" />

            <div className="space-y-6">
                {/* Header & Add Button */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h3 className="text-lg font-bold text-slate-800">
                            {isProducer ? 'Mes programmes soumis & projets' : 'Programmes audiovisuels de la chaîne'}
                        </h3>
                        <p className="text-xs text-slate-500">
                            Total : {programs.total} œuvre{programs.total > 1 ? 's' : ''} répertoriée{programs.total > 1 ? 's' : ''}
                        </p>
                    </div>

                    {(isProducer || auth.user.role === 'admin') && (
                        <Link
                            href={route('programs.create')}
                            className="inline-flex items-center px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition"
                        >
                            <Plus className="w-4 h-4 mr-1.5" />
                            Nouveau programme
                        </Link>
                    )}
                </div>

                {/* Search & Filter Bar */}
                <form
                    onSubmit={applyFilters}
                    className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3"
                >
                    <div className="md:col-span-2 relative">
                        <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Rechercher par titre..."
                            className="w-full pl-9 text-xs rounded-lg border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <select
                            value={categoryId}
                            onChange={(e) => setCategoryId(e.target.value)}
                            className="w-full text-xs rounded-lg border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                        >
                            <option value="">Toutes catégories</option>
                            {categories.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <select
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            className="w-full text-xs rounded-lg border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                        >
                            <option value="">Toutes langues</option>
                            <option value="ar">Arabe</option>
                            <option value="darija">Darija</option>
                            <option value="fr">Français</option>
                        </select>
                    </div>

                    <div>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="w-full text-xs rounded-lg border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                        >
                            <option value="">Tous statuts</option>
                            <option value="brouillon">Brouillon</option>
                            <option value="soumis">En validation</option>
                            <option value="valide">Validé</option>
                            <option value="rejete">Rejeté</option>
                        </select>
                    </div>

                    <div className="sm:col-span-2 md:col-span-5 flex items-center justify-end space-x-2 pt-1 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={resetFilters}
                            className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-100 transition"
                        >
                            Réinitialiser
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold shadow-sm transition"
                        >
                            Filtrer
                        </button>
                    </div>
                </form>

                {/* Programs Grid Cards */}
                {programs.data.length === 0 ? (
                    <div className="bg-white p-12 text-center rounded-xl border border-slate-200 shadow-sm">
                        <Tv className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                        <h4 className="font-semibold text-slate-700 text-sm">Aucun programme trouvé</h4>
                        <p className="text-xs text-slate-400 mt-1">Modifiez vos critères de recherche ou ajoutez un nouveau programme.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {programs.data.map((p) => {
                            const badge = statusBadges[p.status] || statusBadges.brouillon;
                            const canEdit =
                                (auth.user.role === 'admin' ||
                                    (auth.user.id === p.producer_id && (p.status === 'brouillon' || p.status === 'rejete')));

                            return (
                                <div
                                    key={p.id}
                                    className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col justify-between overflow-hidden"
                                >
                                    <div className="p-5">
                                        <div className="flex items-center justify-between gap-2 mb-2">
                                            <span
                                                className="text-[11px] font-semibold px-2 py-0.5 rounded-full text-white"
                                                style={{ backgroundColor: p.category?.color || '#3b82f6' }}
                                            >
                                                {p.category?.name}
                                            </span>

                                            <span
                                                className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${badge.bg} ${badge.text}`}
                                            >
                                                {badge.label}
                                            </span>
                                        </div>

                                        <h4 className="text-base font-bold text-slate-900 line-clamp-1 mb-1">
                                            {p.title}
                                        </h4>

                                        <p className="text-xs text-slate-500 line-clamp-2 mb-3">
                                            {p.synopsis || 'Aucun synopsis disponible.'}
                                        </p>

                                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                                            <span className="flex items-center">
                                                <Clock className="w-3.5 h-3.5 mr-1 text-slate-400" />
                                                {p.duration_minutes} min
                                            </span>
                                            <span>{langLabels[p.language] || p.language}</span>
                                            <span>{p.episodes_count || 0} épisodes</span>
                                        </div>

                                        {p.status === 'rejete' && p.rejection_reason && (
                                            <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-[11px] text-red-700 flex items-start space-x-1.5">
                                                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                                                <span><strong>Motif de refus :</strong> {p.rejection_reason}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="bg-slate-50 px-5 py-3 border-t border-slate-100 flex items-center justify-between">
                                        <span className="text-[11px] text-slate-400 truncate max-w-[140px]">
                                            Prod: {p.producer?.name || 'Inconnu'}
                                        </span>
                                        <div className="flex items-center space-x-2">
                                            {canEdit && (
                                                <Link
                                                    href={route('programs.edit', p.id)}
                                                    className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-200/60 rounded transition"
                                                    title="Modifier"
                                                >
                                                    <Edit3 className="w-4 h-4" />
                                                </Link>
                                            )}
                                            <Link
                                                href={route('programs.show', p.id)}
                                                className="inline-flex items-center px-3 py-1 bg-white border border-slate-300 hover:bg-slate-100 rounded text-xs font-semibold text-slate-700 shadow-2xs transition"
                                            >
                                                <Eye className="w-3.5 h-3.5 mr-1" />
                                                Consulter
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Pagination */}
                {programs.links && programs.links.length > 3 && (
                    <div className="flex items-center justify-center space-x-1 pt-4">
                        {programs.links.map((link, idx) => (
                            <Link
                                key={idx}
                                href={link.url || '#'}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                                className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${
                                    link.active
                                        ? 'bg-blue-600 text-white font-bold'
                                        : link.url
                                        ? 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                                        : 'text-slate-300 cursor-not-allowed'
                                }`}
                            />
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
