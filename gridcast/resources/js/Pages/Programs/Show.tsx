import React, { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Program, PageProps } from '@/types';
import {
    ArrowLeft,
    CheckCircle,
    XCircle,
    Send,
    Edit3,
    Trash2,
    Plus,
    AlertCircle,
} from 'lucide-react';

interface Props extends PageProps {
    program: Program;
    canEdit: boolean;
    canValidate: boolean;
}

export default function ProgramShow({ program, canEdit, canValidate, auth }: Props) {
    const [rejectModalOpen, setRejectModalOpen] = useState(false);
    const [addEpisodeModalOpen, setAddEpisodeModalOpen] = useState(false);

    const {
        data: rejectData,
        setData: setRejectData,
        post: postReject,
        processing: rejectProcessing,
        errors: rejectErrors,
    } = useForm({
        status: 'rejete',
        rejection_reason: '',
    });

    const {
        data: episodeData,
        setData: setEpisodeData,
        post: postEpisode,
        processing: episodeProcessing,
        reset: resetEpisode,
        errors: episodeErrors,
    } = useForm({
        program_id: program.id,
        season: 1,
        episode_number: (program.episodes?.length || 0) + 1,
        title: '',
        air_status: 'a_venir',
    });

    const handleStatusChange = (status: string, reason?: string) => {
        router.post(
            route('programs.status', program.id),
            { status, rejection_reason: reason },
            { preserveScroll: true }
        );
    };

    const handleRejectSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        postReject(route('programs.status', program.id), {
            preserveScroll: true,
            onSuccess: () => setRejectModalOpen(false),
        });
    };

    const handleEpisodeSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        postEpisode(route('episodes.store'), {
            preserveScroll: true,
            onSuccess: () => {
                resetEpisode();
                setAddEpisodeModalOpen(false);
            },
        });
    };

    const handleDeleteProgram = () => {
        if (confirm('Voulez-vous vraiment supprimer définitivement ce programme ?')) {
            router.delete(route('programs.destroy', program.id));
        }
    };

    const handleDeleteEpisode = (episodeId: number) => {
        if (confirm('Supprimer cet épisode ?')) {
            router.delete(route('episodes.destroy', episodeId), { preserveScroll: true });
        }
    };

    const statusBadges: Record<string, { bg: string; text: string; label: string }> = {
        brouillon: { bg: 'bg-slate-100 border-slate-200', text: 'text-slate-700', label: 'Brouillon' },
        soumis: { bg: 'bg-amber-100 border-amber-200', text: 'text-amber-800', label: 'En attente de validation' },
        valide: { bg: 'bg-emerald-100 border-emerald-200', text: 'text-emerald-800', label: 'Validé pour diffusion' },
        rejete: { bg: 'bg-red-100 border-red-200', text: 'text-red-800', label: 'Refusé' },
    };

    const badge = statusBadges[program.status] || statusBadges.brouillon;

    return (
        <AppLayout title={program.title}>
            <Head title={program.title} />

            <div className="space-y-6 max-w-5xl mx-auto">
                {/* Back button & Action Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <Link
                        href={route('programs.index')}
                        className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
                    >
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Retour au catalogue
                    </Link>

                    <div className="flex flex-wrap items-center gap-2">
                        {/* Producer Actions */}
                        {auth.user.id === program.producer_id &&
                            (program.status === 'brouillon' || program.status === 'rejete') && (
                                <button
                                    onClick={() => handleStatusChange('soumis')}
                                    className="inline-flex items-center px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition"
                                >
                                    <Send className="w-3.5 h-3.5 mr-1.5" />
                                    Soumettre à la programmation
                                </button>
                            )}

                        {/* Programmation Team Actions */}
                        {canValidate && (
                            <>
                                <button
                                    onClick={() => handleStatusChange('valide')}
                                    className="inline-flex items-center px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition"
                                >
                                    <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
                                    Valider le programme
                                </button>
                                <button
                                    onClick={() => setRejectModalOpen(true)}
                                    className="inline-flex items-center px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-sm transition"
                                >
                                    <XCircle className="w-3.5 h-3.5 mr-1.5" />
                                    Refuser
                                </button>
                            </>
                        )}

                        {canEdit && (
                            <Link
                                href={route('programs.edit', program.id)}
                                className="inline-flex items-center px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition"
                            >
                                <Edit3 className="w-3.5 h-3.5 mr-1.5" />
                                Modifier
                            </Link>
                        )}

                        {(auth.user.role === 'admin' ||
                            (auth.user.id === program.producer_id && program.status === 'brouillon')) && (
                            <button
                                onClick={handleDeleteProgram}
                                className="inline-flex items-center px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold transition"
                            >
                                <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                                Supprimer
                            </button>
                        )}
                    </div>
                </div>

                {/* Main Program Card */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
                    <div className="flex flex-col sm:flex-row items-start justify-between gap-3">
                        <div>
                            <div className="flex items-center space-x-2 mb-2">
                                <span
                                    className="text-xs font-semibold px-2.5 py-0.5 rounded-full text-white"
                                    style={{ backgroundColor: program.category?.color || '#3b82f6' }}
                                >
                                    {program.category?.name}
                                </span>
                                <span
                                    className={`text-xs font-semibold px-2.5 py-0.5 rounded border ${badge.bg} ${badge.text}`}
                                >
                                    {badge.label}
                                </span>
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900">{program.title}</h2>
                            <p className="text-xs text-slate-500 mt-1">
                                Producteur : <span className="font-semibold text-slate-700">{program.producer?.name}</span> ({program.producer?.email})
                            </p>
                        </div>

                        <div className="text-left sm:text-right text-xs text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-100">
                            <div>Durée unitaire : <strong className="text-slate-800">{program.duration_minutes} minutes</strong></div>
                            <div>Langue : <strong className="text-slate-800 capitalize">{program.language}</strong></div>
                            <div>Créé le : {new Date(program.created_at || '').toLocaleDateString('fr-FR')}</div>
                        </div>
                    </div>

                    {program.status === 'rejete' && program.rejection_reason && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800 flex items-start space-x-2">
                            <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-600 mt-0.5" />
                            <div>
                                <h5 className="font-bold">Motif du rejet par la programmation :</h5>
                                <p className="mt-0.5">{program.rejection_reason}</p>
                            </div>
                        </div>
                    )}

                    <div>
                        <h4 className="font-bold text-sm text-slate-800 mb-2">Synopsis & Concept</h4>
                        <div className="p-4 rounded-lg bg-slate-50 border border-slate-100 text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                            {program.synopsis || 'Aucun synopsis fourni.'}
                        </div>
                    </div>
                </div>

                {/* Episodes Section */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="font-bold text-base text-slate-900">
                                Épisodes ({program.episodes?.length || 0})
                            </h4>
                            <p className="text-xs text-slate-500">Liste des numéros et saisons enregistrés</p>
                        </div>

                        {(auth.user.id === program.producer_id || auth.user.role === 'admin') && (
                            <button
                                onClick={() => setAddEpisodeModalOpen(true)}
                                className="inline-flex items-center px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold shadow-sm transition"
                            >
                                <Plus className="w-4 h-4 mr-1.5" />
                                Ajouter un épisode
                            </button>
                        )}
                    </div>

                    {(!program.episodes || program.episodes.length === 0) ? (
                        <p className="text-xs text-slate-400 py-4 text-center">Aucun épisode ajouté pour le moment.</p>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {program.episodes.map((ep) => (
                                <div key={ep.id} className="py-3 flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 font-bold text-xs flex items-center justify-center">
                                            E{ep.episode_number}
                                        </div>
                                        <div>
                                            <h5 className="font-bold text-xs text-slate-800">
                                                Saison {ep.season} • {ep.title}
                                            </h5>
                                            <span className="text-[10px] text-slate-400 capitalize">Statut : {ep.air_status}</span>
                                        </div>
                                    </div>

                                    {(auth.user.id === program.producer_id || auth.user.role === 'admin') && (
                                        <button
                                            onClick={() => handleDeleteEpisode(ep.id)}
                                            className="text-slate-400 hover:text-red-600 p-1 transition"
                                            title="Supprimer"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Rejet */}
            {rejectModalOpen && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border border-slate-200">
                        <h4 className="font-bold text-slate-800 text-sm mb-2">Rejeter le programme</h4>
                        <p className="text-xs text-slate-500 mb-4">
                            Veuillez motiver le refus. Le producteur recevra une notification avec cette explication pour correction.
                        </p>
                        <form onSubmit={handleRejectSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">
                                    Motif du rejet <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    rows={4}
                                    value={rejectData.rejection_reason}
                                    onChange={(e) => setRejectData('rejection_reason', e.target.value)}
                                    placeholder="Ex: Budget trop élevé, format inadapté à la case horaire..."
                                    className="w-full text-xs rounded-lg border-slate-300 focus:border-red-500 focus:ring-red-500"
                                    required
                                />
                                {rejectErrors.rejection_reason && (
                                    <p className="text-red-600 text-xs mt-1">{rejectErrors.rejection_reason}</p>
                                )}
                            </div>
                            <div className="flex items-center justify-end space-x-2">
                                <button
                                    type="button"
                                    onClick={() => setRejectModalOpen(false)}
                                    className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    disabled={rejectProcessing}
                                    className="px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-sm"
                                >
                                    Confirmer le refus
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Ajout Épisode */}
            {addEpisodeModalOpen && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border border-slate-200">
                        <h4 className="font-bold text-slate-800 text-sm mb-4">Ajouter un épisode</h4>
                        <form onSubmit={handleEpisodeSubmit} className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">Saison</label>
                                    <input
                                        type="number"
                                        min={1}
                                        value={episodeData.season}
                                        onChange={(e) => setEpisodeData('season', Number(e.target.value))}
                                        className="w-full text-xs rounded-lg border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">N° Épisode</label>
                                    <input
                                        type="number"
                                        min={1}
                                        value={episodeData.episode_number}
                                        onChange={(e) => setEpisodeData('episode_number', Number(e.target.value))}
                                        className="w-full text-xs rounded-lg border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">Titre de l'épisode</label>
                                <input
                                    type="text"
                                    value={episodeData.title}
                                    onChange={(e) => setEpisodeData('title', e.target.value)}
                                    placeholder="Ex: Le retour au village"
                                    className="w-full text-xs rounded-lg border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                                    required
                                />
                                {episodeErrors.title && <p className="text-red-600 text-xs mt-1">{episodeErrors.title}</p>}
                            </div>
                            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setAddEpisodeModalOpen(false)}
                                    className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    disabled={episodeProcessing}
                                    className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm"
                                >
                                    Enregistrer l'épisode
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
