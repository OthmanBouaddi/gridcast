import React, { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Program, PageProps } from '@/types';
import { CheckCircle, XCircle, Eye, Clock, CheckSquare } from 'lucide-react';

interface Paginated<T> {
    data: T[];
    links: { url: string | null; label: string; active: boolean }[];
    total: number;
}

interface Props extends PageProps {
    programs: Paginated<Program>;
}

export default function ValidationQueue({ programs }: Props) {
    const [rejectModalOpen, setRejectModalOpen] = useState(false);
    const [selectedProgramId, setSelectedProgramId] = useState<number | null>(null);

    const { data, setData, post, processing, reset, errors } = useForm({
        status: 'rejete',
        rejection_reason: '',
    });

    const handleValidate = (programId: number) => {
        router.post(
            route('programs.status', programId),
            { status: 'valide' },
            { preserveScroll: true }
        );
    };

    const openRejectModal = (programId: number) => {
        setSelectedProgramId(programId);
        reset();
        setRejectModalOpen(true);
    };

    const handleRejectSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProgramId) return;

        post(route('programs.status', selectedProgramId), {
            preserveScroll: true,
            onSuccess: () => setRejectModalOpen(false),
        });
    };

    const langLabels: Record<string, string> = {
        ar: 'Arabe',
        darija: 'Darija',
        fr: 'Français',
    };

    return (
        <AppLayout title="File de validation des programmes">
            <Head title="File de validation" />

            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-bold text-slate-800 flex items-center space-x-2">
                        <CheckSquare className="w-5 h-5 text-blue-600" />
                        <span>Programmes en attente d'approbation éditoriale</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                        {programs.total} projet{programs.total > 1 ? 's' : ''} soumis par les producteurs requièrent votre validation avant inscription à la grille.
                    </p>
                </div>

                {programs.data.length === 0 ? (
                    <div className="bg-white p-12 text-center rounded-xl border border-slate-200 shadow-sm">
                        <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
                        <h4 className="font-bold text-slate-800 text-sm">File de validation vide</h4>
                        <p className="text-xs text-slate-500 mt-1">
                            Tous les programmes soumis ont été examinés par l'équipe de programmation.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {programs.data.map((program) => (
                            <div
                                key={program.id}
                                className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                            >
                                <div className="space-y-1.5 flex-1 min-w-0">
                                    <div className="flex items-center space-x-2">
                                        <span
                                            className="text-[11px] font-semibold px-2 py-0.5 rounded-full text-white"
                                            style={{ backgroundColor: program.category?.color || '#3b82f6' }}
                                        >
                                            {program.category?.name}
                                        </span>
                                        <span className="text-[11px] text-slate-400">
                                            Soumis le {new Date(program.created_at || '').toLocaleDateString('fr-FR')}
                                        </span>
                                    </div>

                                    <h4 className="text-base font-bold text-slate-900">{program.title}</h4>

                                    <p className="text-xs text-slate-600 line-clamp-2">
                                        {program.synopsis || 'Aucun synopsis.'}
                                    </p>

                                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-1">
                                        <span className="flex items-center">
                                            <Clock className="w-3.5 h-3.5 mr-1 text-slate-400" />
                                            {program.duration_minutes} min
                                        </span>
                                        <span>•</span>
                                        <span>Langue : {langLabels[program.language] || program.language}</span>
                                        <span>•</span>
                                        <span>Producteur : <strong>{program.producer?.name}</strong></span>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-2 flex-shrink-0 self-end md:self-center">
                                    <Link
                                        href={route('programs.show', program.id)}
                                        className="p-2 border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold flex items-center transition"
                                        title="Détails complets"
                                    >
                                        <Eye className="w-4 h-4 mr-1" />
                                        Examiner
                                    </Link>

                                    <button
                                        onClick={() => openRejectModal(program.id)}
                                        className="px-3 py-2 border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-xs font-semibold flex items-center transition"
                                    >
                                        <XCircle className="w-4 h-4 mr-1" />
                                        Refuser
                                    </button>

                                    <button
                                        onClick={() => handleValidate(program.id)}
                                        className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center shadow-sm transition"
                                    >
                                        <CheckCircle className="w-4 h-4 mr-1" />
                                        Valider
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal Rejet */}
            {rejectModalOpen && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border border-slate-200">
                        <h4 className="font-bold text-slate-800 text-sm mb-2">Rejeter le programme</h4>
                        <p className="text-xs text-slate-500 mb-4">
                            Indiquez les motifs du refus. Le producteur recevra une notification automatique.
                        </p>
                        <form onSubmit={handleRejectSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">
                                    Motif du refus <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    rows={4}
                                    value={data.rejection_reason}
                                    onChange={(e) => setData('rejection_reason', e.target.value)}
                                    placeholder="Ex: Durée non conforme aux formats de la grille..."
                                    className="w-full text-xs rounded-lg border-slate-300 focus:border-red-500 focus:ring-red-500"
                                    required
                                />
                                {errors.rejection_reason && (
                                    <p className="text-red-600 text-xs mt-1">{errors.rejection_reason}</p>
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
                                    disabled={processing}
                                    className="px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-sm"
                                >
                                    Confirmer le refus
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
