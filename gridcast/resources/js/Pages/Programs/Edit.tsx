import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Category, Program, PageProps } from '@/types';
import { ArrowLeft, Save } from 'lucide-react';

interface Props extends PageProps {
    program: Program;
    categories: Category[];
}

export default function ProgramEdit({ program, categories }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        title: program.title,
        category_id: program.category_id,
        language: program.language,
        synopsis: program.synopsis || '',
        duration_minutes: program.duration_minutes,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('programs.update', program.id));
    };

    return (
        <AppLayout title="Modifier le programme">
            <Head title={`Modifier ${program.title}`} />

            <div className="max-w-3xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <Link
                        href={route('programs.show', program.id)}
                        className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
                    >
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Retour au programme
                    </Link>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-100">
                        <h3 className="text-base font-bold text-slate-900">Édition de la fiche programme</h3>
                    </div>

                    <form onSubmit={submit} className="p-6 space-y-5">
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Titre du programme <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={data.title}
                                onChange={(e) => setData('title', e.target.value)}
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
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">
                                    Langue <span className="text-red-500">*</span>
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
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">
                                    Durée (minutes) <span className="text-red-500">*</span>
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
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">Synopsis</label>
                            <textarea
                                rows={5}
                                value={data.synopsis}
                                onChange={(e) => setData('synopsis', e.target.value)}
                                className="w-full text-xs rounded-lg border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                            />
                        </div>

                        <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-xs font-semibold text-white shadow-sm transition"
                            >
                                <Save className="w-4 h-4 mr-1.5" />
                                Enregistrer les modifications
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
