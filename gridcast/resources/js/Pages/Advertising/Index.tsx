import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Advertiser, AdvertisingSlot, BroadcastSlot, PageProps } from '@/types';
import {
    DollarSign,
    TrendingUp,
    Users,
    Plus,
    Bell,
    Trash2,
    CheckCircle,
    X,
} from 'lucide-react';

interface Paginated<T> {
    data: T[];
    links: { url: string | null; label: string; active: boolean }[];
    total: number;
}

interface Props extends PageProps {
    slots: Paginated<AdvertisingSlot>;
    advertisers: Advertiser[];
    availableBroadcastSlots: BroadcastSlot[];
    filters: {
        start_date?: string;
        end_date?: string;
        advertiser_id?: string;
        status?: string;
    };
    metrics: {
        totalRevenue: number;
        projectedRevenue: number;
        allRevenue: number;
        totalSlotsCount: number;
    };
}

export default function AdvertisingIndex({
    slots,
    advertisers,
    availableBroadcastSlots,
    filters,
    metrics,
}: Props) {
    const [activeTab, setActiveTab] = useState<'slots' | 'advertisers'>('slots');
    const [createSlotModalOpen, setCreateSlotModalOpen] = useState(false);
    const [createAdvertiserModalOpen, setCreateAdvertiserModalOpen] = useState(false);

    // Filter states
    const [startDate, setStartDate] = useState(filters.start_date || '');
    const [endDate, setEndDate] = useState(filters.end_date || '');
    const [advertiserFilter, setAdvertiserFilter] = useState(filters.advertiser_id || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || '');

    // Form for new Slot
    const {
        data: slotData,
        setData: setSlotData,
        post: postSlot,
        processing: slotProcessing,
        reset: resetSlot,
        errors: _slotErrors,
    } = useForm({
        advertiser_id: advertisers[0]?.id || '',
        broadcast_slot_id: '' as number | '',
        campaign_name: '',
        broadcast_date: '',
        duration_seconds: 30,
        price: 10000,
        status: 'reserve',
    });

    // Form for new Advertiser
    const {
        data: advData,
        setData: setAdvData,
        post: postAdv,
        processing: advProcessing,
        reset: resetAdv,
        errors: _advErrors,
    } = useForm({
        company_name: '',
        contact_email: '',
        contact_phone: '',
        notes: '',
    });

    const applyFilters = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        router.get(
            route('advertising.index'),
            {
                start_date: startDate || undefined,
                end_date: endDate || undefined,
                advertiser_id: advertiserFilter || undefined,
                status: statusFilter || undefined,
            },
            { preserveState: true }
        );
    };

    const resetFilters = () => {
        setStartDate('');
        setEndDate('');
        setAdvertiserFilter('');
        setStatusFilter('');
        router.get(route('advertising.index'));
    };

    const handleCreateSlotSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        postSlot(route('advertising.slots.store'), {
            preserveScroll: true,
            onSuccess: () => {
                resetSlot();
                setCreateSlotModalOpen(false);
            },
        });
    };

    const handleCreateAdvertiserSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        postAdv(route('advertisers.store'), {
            preserveScroll: true,
            onSuccess: () => {
                resetAdv();
                setCreateAdvertiserModalOpen(false);
            },
        });
    };

    const handleNotifyExpiry = (slotId: number) => {
        router.post(route('advertising.slots.notify', slotId), {}, { preserveScroll: true });
    };

    const handleStatusChange = (slotId: number, newStatus: string) => {
        router.put(
            route('advertising.slots.update', slotId),
            { status: newStatus },
            { preserveScroll: true }
        );
    };

    const handleDeleteSlot = (slotId: number) => {
        if (confirm('Supprimer ce créneau publicitaire ?')) {
            router.delete(route('advertising.slots.destroy', slotId), { preserveScroll: true });
        }
    };

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD', maximumFractionDigits: 0 }).format(val);

    const statusBadgeClasses: Record<string, string> = {
        diffuse: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        reserve: 'bg-amber-100 text-amber-800 border-amber-200',
        annule: 'bg-red-100 text-red-800 border-red-200',
    };

    return (
        <AppLayout title="Régie publicitaire & Commercialisation">
            <Head title="Régie Publicitaire" />

            <div className="space-y-6">
                {/* Financial KPIs Header */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                        <div>
                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                CA Diffusé (Réalisé)
                            </span>
                            <h3 className="text-2xl font-bold text-emerald-600 mt-1">
                                {formatCurrency(metrics.totalRevenue)}
                            </h3>
                            <span className="text-xs text-slate-500">Facturation confirmée</span>
                        </div>
                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
                            <CheckCircle className="w-6 h-6" />
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                        <div>
                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                CA Réservé (Prévisionnel)
                            </span>
                            <h3 className="text-2xl font-bold text-amber-600 mt-1">
                                {formatCurrency(metrics.projectedRevenue)}
                            </h3>
                            <span className="text-xs text-slate-500">Spots en attente de diffusion</span>
                        </div>
                        <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                        <div>
                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                CA Total Période
                            </span>
                            <h3 className="text-2xl font-bold text-slate-900 mt-1">
                                {formatCurrency(metrics.allRevenue)}
                            </h3>
                            <span className="text-xs text-blue-600 font-semibold">{metrics.totalSlotsCount} créneaux réservés</span>
                        </div>
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                            <DollarSign className="w-6 h-6" />
                        </div>
                    </div>
                </div>

                {/* Tabs & Add Buttons */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex rounded-lg bg-slate-200 p-1">
                        <button
                            onClick={() => setActiveTab('slots')}
                            className={`px-4 py-1.5 rounded-md text-xs font-semibold transition ${
                                activeTab === 'slots' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            Créneaux & Campagnes ({slots.total})
                        </button>
                        <button
                            onClick={() => setActiveTab('advertisers')}
                            className={`px-4 py-1.5 rounded-md text-xs font-semibold transition ${
                                activeTab === 'advertisers' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            Portefeuille Annonceurs ({advertisers.length})
                        </button>
                    </div>

                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => setCreateAdvertiserModalOpen(true)}
                            className="inline-flex items-center px-3.5 py-2 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition"
                        >
                            <Users className="w-4 h-4 mr-1.5" />
                            Nouvel Annonceur
                        </button>

                        <button
                            onClick={() => setCreateSlotModalOpen(true)}
                            className="inline-flex items-center px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition"
                        >
                            <Plus className="w-4 h-4 mr-1.5" />
                            Réserver un créneau pub
                        </button>
                    </div>
                </div>

                {/* TAB 1: Slots Management */}
                {activeTab === 'slots' && (
                    <div className="space-y-4">
                        {/* Period & Filter Bar */}
                        <form
                            onSubmit={applyFilters}
                            className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3"
                        >
                            <div>
                                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Date début</label>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="w-full text-xs rounded-lg border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Date fin</label>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="w-full text-xs rounded-lg border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Annonceur</label>
                                <select
                                    value={advertiserFilter}
                                    onChange={(e) => setAdvertiserFilter(e.target.value)}
                                    className="w-full text-xs rounded-lg border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                                >
                                    <option value="">Tous annonceurs</option>
                                    {advertisers.map((a) => (
                                        <option key={a.id} value={a.id}>
                                            {a.company_name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Statut</label>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="w-full text-xs rounded-lg border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                                >
                                    <option value="">Tous statuts</option>
                                    <option value="reserve">Réservé</option>
                                    <option value="diffuse">Diffusé</option>
                                    <option value="annule">Annulé</option>
                                </select>
                            </div>

                            <div className="flex items-end space-x-2">
                                <button
                                    type="submit"
                                    className="flex-1 py-2 rounded-lg bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold shadow-sm transition"
                                >
                                    Filtrer
                                </button>
                                <button
                                    type="button"
                                    onClick={resetFilters}
                                    className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100"
                                    title="Réinitialiser"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </form>

                        {/* Slots Table */}
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden overflow-x-auto">
                            <table className="w-full text-left text-xs text-slate-600">
                                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold text-[11px]">
                                    <tr>
                                        <th className="p-3.5">Annonceur</th>
                                        <th className="p-3.5">Campagne</th>
                                        <th className="p-3.5">Date Diffusion</th>
                                        <th className="p-3.5">Durée</th>
                                        <th className="p-3.5">Prix (MAD)</th>
                                        <th className="p-3.5">Statut</th>
                                        <th className="p-3.5 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {slots.data.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="p-6 text-center text-slate-400">
                                                Aucun créneau publicitaire pour cette sélection.
                                            </td>
                                        </tr>
                                    ) : (
                                        slots.data.map((slot) => (
                                            <tr key={slot.id} className="hover:bg-slate-50/60 transition">
                                                <td className="p-3.5 font-bold text-slate-900">
                                                    {slot.advertiser?.company_name}
                                                </td>
                                                <td className="p-3.5 font-medium">{slot.campaign_name || 'Spot standard'}</td>
                                                <td className="p-3.5">
                                                    {slot.broadcast_date
                                                        ? new Date(slot.broadcast_date).toLocaleDateString('fr-FR', {
                                                              day: '2-digit',
                                                              month: 'short',
                                                              year: 'numeric',
                                                              hour: '2-digit',
                                                              minute: '2-digit',
                                                          })
                                                        : 'À programmer'}
                                                </td>
                                                <td className="p-3.5">{slot.duration_seconds} sec</td>
                                                <td className="p-3.5 font-semibold text-slate-900">
                                                    {formatCurrency(Number(slot.price))}
                                                </td>
                                                <td className="p-3.5">
                                                    <span
                                                        className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${
                                                            statusBadgeClasses[slot.status] || 'bg-slate-100 text-slate-700'
                                                        }`}
                                                    >
                                                        {slot.status === 'diffuse'
                                                            ? 'Diffusé'
                                                            : slot.status === 'reserve'
                                                            ? 'Réservé'
                                                            : 'Annulé'}
                                                    </span>
                                                </td>
                                                <td className="p-3.5 text-right space-x-1.5">
                                                    <button
                                                        onClick={() => handleNotifyExpiry(slot.id)}
                                                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition"
                                                        title="Envoyer rappel / alerte échéance"
                                                    >
                                                        <Bell className="w-4 h-4" />
                                                    </button>
                                                    {slot.status !== 'diffuse' && (
                                                        <button
                                                            onClick={() => handleStatusChange(slot.id, 'diffuse')}
                                                            className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded transition"
                                                            title="Marquer comme diffusé"
                                                        >
                                                            <CheckCircle className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleDeleteSlot(slot.id)}
                                                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition"
                                                        title="Supprimer"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* TAB 2: Advertisers Directory */}
                {activeTab === 'advertisers' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {advertisers.map((adv) => (
                            <div key={adv.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
                                <h4 className="font-bold text-slate-900 text-sm">{adv.company_name}</h4>
                                <div className="text-xs text-slate-500 space-y-1">
                                    <p>Email : <span className="text-slate-800">{adv.contact_email}</span></p>
                                    <p>Tél : <span className="text-slate-800">{adv.contact_phone}</span></p>
                                    {adv.notes && <p className="italic text-slate-400 text-[11px]">{adv.notes}</p>}
                                </div>
                                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                                    <span className="text-blue-600 font-semibold">
                                        {adv.advertising_slots_count || 0} campagnes
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal: Réserver un créneau pub */}
            {createSlotModalOpen && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 border border-slate-200">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <h3 className="font-bold text-slate-800 text-base">Réserver un créneau publicitaire</h3>
                            <button
                                onClick={() => setCreateSlotModalOpen(false)}
                                className="text-slate-400 hover:text-slate-600 p-1"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateSlotSubmit} className="mt-4 space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">
                                    Annonceur <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={slotData.advertiser_id}
                                    onChange={(e) => setSlotData('advertiser_id', Number(e.target.value))}
                                    className="w-full text-xs rounded-lg border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                                    required
                                >
                                    {advertisers.map((a) => (
                                        <option key={a.id} value={a.id}>
                                            {a.company_name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">
                                    Nom de la campagne <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={slotData.campaign_name}
                                    onChange={(e) => setSlotData('campaign_name', e.target.value)}
                                    placeholder="Ex: Campagne Lancement Fibre 2026"
                                    className="w-full text-xs rounded-lg border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">Date et heure</label>
                                    <input
                                        type="datetime-local"
                                        value={slotData.broadcast_date}
                                        onChange={(e) => setSlotData('broadcast_date', e.target.value)}
                                        className="w-full text-xs rounded-lg border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">Créneau antenne lié</label>
                                    <select
                                        value={slotData.broadcast_slot_id}
                                        onChange={(e) =>
                                            setSlotData('broadcast_slot_id', e.target.value ? Number(e.target.value) : '')
                                        }
                                        className="w-full text-xs rounded-lg border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                                    >
                                        <option value="">Spot autonome / Hors créneau fixe</option>
                                        {availableBroadcastSlots.map((bs) => (
                                            <option key={bs.id} value={bs.id}>
                                                {bs.title || bs.channel_zone} (
                                                {new Date(bs.start_datetime).toLocaleDateString('fr-FR', {
                                                    day: '2-digit',
                                                    month: 'short',
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                                )
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">Durée (sec)</label>
                                    <input
                                        type="number"
                                        min={5}
                                        max={300}
                                        value={slotData.duration_seconds}
                                        onChange={(e) => setSlotData('duration_seconds', Number(e.target.value))}
                                        className="w-full text-xs rounded-lg border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">Prix (MAD)</label>
                                    <input
                                        type="number"
                                        min={0}
                                        step={500}
                                        value={slotData.price}
                                        onChange={(e) => setSlotData('price', Number(e.target.value))}
                                        className="w-full text-xs rounded-lg border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">Statut initial</label>
                                    <select
                                        value={slotData.status}
                                        onChange={(e) => setSlotData('status', e.target.value as any)}
                                        className="w-full text-xs rounded-lg border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                                    >
                                        <option value="reserve">Réservé</option>
                                        <option value="diffuse">Diffusé</option>
                                    </select>
                                </div>
                            </div>

                            <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
                                <button
                                    type="button"
                                    onClick={() => setCreateSlotModalOpen(false)}
                                    className="px-3.5 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    disabled={slotProcessing}
                                    className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm"
                                >
                                    Enregistrer la réservation
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal: Nouvel Annonceur */}
            {createAdvertiserModalOpen && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border border-slate-200">
                        <h4 className="font-bold text-slate-800 text-sm mb-4">Créer une fiche annonceur</h4>
                        <form onSubmit={handleCreateAdvertiserSubmit} className="space-y-3">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">
                                    Raison sociale / Entreprise <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={advData.company_name}
                                    onChange={(e) => setAdvData('company_name', e.target.value)}
                                    placeholder="Ex: Maroc Telecom ou Attijariwafa Bank"
                                    className="w-full text-xs rounded-lg border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                                        Email contact <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        value={advData.contact_email}
                                        onChange={(e) => setAdvData('contact_email', e.target.value)}
                                        className="w-full text-xs rounded-lg border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                                        Téléphone <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={advData.contact_phone}
                                        onChange={(e) => setAdvData('contact_phone', e.target.value)}
                                        placeholder="+212 5..."
                                        className="w-full text-xs rounded-lg border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">Notes</label>
                                <textarea
                                    rows={3}
                                    value={advData.notes}
                                    onChange={(e) => setAdvData('notes', e.target.value)}
                                    placeholder="Remarques contractuelles, agence média..."
                                    className="w-full text-xs rounded-lg border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                                />
                            </div>
                            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setCreateAdvertiserModalOpen(false)}
                                    className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    disabled={advProcessing}
                                    className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm"
                                >
                                    Créer l'annonceur
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
