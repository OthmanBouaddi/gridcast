import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Category, PageProps } from '@/types';
import { ArrowLeft, Save, Send } from 'lucide-react';

interface Props extends PageProps {
    categories: Category[];
}

export default function ProgramCreate({ categories }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        title: '',
        category_id: categories[0]?.id || '',
        language: 'ar',
        synopsis: '',
        duration_minutes: 30,
        submit_now: false,
    });

    const submit = (submitNow: boolean) => {
        data.submit_now = submitNow;
        post(route('programs.store'));
    };

    return (
        <AppLayout title="Soumission de programme">
            <Head title="Nouveau programme" />

            <div className="max-w-3xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <Link
                        href={route('programs.index')}
                        className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
                    >
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Retour au catalogue
                    </Link>
                    <span className="text-xs text-slate-400 font-medium">Espace Production & Réalisation</span>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-100">
                        <h3 className="text-base font-bold text-slate-900">Dépôt d'une fiche programme</h3>
                        <p className="text-xs text-slate-500 mt-1">
                            Renseignez les détails techniques et artistiques de votre contenu audiovisuel avant soumission au comité de programmation.
                        </p>
                    </div>

                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            submit(false);
                        }}
                        className="p-6 space-y-5"
                    >
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Titre du programme <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={data.title}
                                onChange={(e) => setData('title', e.target.value)}
                                placeholder="Ex: المسائية (Al Massaiya) ou Dar Lghizlane"
                                className="w-full text-xs rounded-lg border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                                required
                            />
                            {errors.title && <p className="text-red-600 text-xs mt-1">{errors.title}</p>}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">
                                    Catégorie <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={data.category_id}
                                    onChange={(e) => setData('category_id', Number(e.target.value))}
                                    className="w-full text-xs rounded-lg border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                                    required
                                >
                                    {categories.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.category_id && <p className="text-red-600 text-xs mt-1">{errors.category_id}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">
                                    Langue d'expression <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={data.language}
                                    onChange={(e) => setData('language', e.target.value as any)}
                                    className="w-full text-xs rounded-lg border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                                    required
                                >
                                    <option value="ar">Arabe classique (العربية)</option>
                                    <option value="darija">Darija marocaine (الدارجة)</option>
                                    <option value="fr">Français</option>
                                </select>
                                {errors.language && <p className="text-red-600 text-xs mt-1">{errors.language}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">
                                    Durée unitaire (minutes) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    min={1}
                                    max={360}
                                    value={data.duration_minutes}
                                    onChange={(e) => setData('duration_minutes', Number(e.target.value))}
                                    className="w-full text-xs rounded-lg border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                                    required
                                />
                                {errors.duration_minutes && (
                                    <p className="text-red-600 text-xs mt-1">{errors.duration_minutes}</p>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Synopsis & Note d'intention
                            </label>
                            <textarea
                                rows={5}
                                value={data.synopsis}
                                onChange={(e) => setData('synopsis', e.target.value)}
                                placeholder="Présentez l'intrigue, le public cible, le concept éditorial ou les intervenants..."
                                className="w-full text-xs rounded-lg border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                            />
                            {errors.synopsis && <p className="text-red-600 text-xs mt-1">{errors.synopsis}</p>}
                        </div>

                        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-end gap-3">
                            <button
                                type="button"
                                disabled={processing}
                                onClick={() => submit(false)}
                                className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                            >
                                <Save className="w-4 h-4 mr-1.5 text-slate-500" />
                                Enregistrer en brouillon
                            </button>

                            <button
                                type="button"
                                disabled={processing}
                                onClick={() => submit(true)}
                                className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-xs font-semibold text-white shadow-sm transition"
                            >
                                <Send className="w-4 h-4 mr-1.5" />
                                Soumettre à la programmation
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
