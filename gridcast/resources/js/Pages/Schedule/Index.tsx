import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { BroadcastSlot, Program, PageProps } from '@/types';
import {
    DndContext,
    DragEndEvent,
    useDraggable,
    useDroppable,
} from '@dnd-kit/core';
import {
    ChevronLeft,
    ChevronRight,
    Plus,
    Trash2,
    X,
    AlertTriangle,
} from 'lucide-react';

interface Props extends PageProps {
    slots: BroadcastSlot[];
    availablePrograms: Program[];
    weekStart: string;
    weekEnd: string;
    channelZones: string[];
    canManageGrid: boolean;
}

const HOURS = Array.from({ length: 17 }, (_, i) => i + 7); // 07:00 to 23:00

// Draggable Slot Card Component
function DraggableSlotCard({
    slot,
    canManageGrid,
    onDelete,
}: {
    slot: BroadcastSlot;
    canManageGrid: boolean;
    onDelete: (id: number) => void;
}) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: `slot-${slot.id}`,
        data: { slot },
        disabled: !canManageGrid,
    });

    const style: React.CSSProperties = {
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
        zIndex: isDragging ? 50 : 1,
        opacity: isDragging ? 0.75 : 1,
    };

    const startTime = new Date(slot.start_datetime).toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
    });
    const endTime = new Date(slot.end_datetime).toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
    });

    const isPub = slot.slot_type === 'pub';
    const categoryColor = slot.program?.category?.color || (isPub ? '#ec4899' : '#3b82f6');

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...(canManageGrid ? { ...listeners, ...attributes } : {})}
            className={`p-2.5 rounded-lg border text-xs shadow-sm mb-2 select-none group transition-shadow ${
                canManageGrid ? 'cursor-grab active:cursor-grabbing hover:shadow-md' : 'cursor-default'
            } ${
                isPub
                    ? 'bg-pink-50/90 border-pink-200 text-pink-900'
                    : 'bg-white border-slate-200 text-slate-800'
            }`}
        >
            <div className="flex items-start justify-between">
                <div className="flex items-center space-x-1.5 flex-1 min-w-0 pr-1">
                    <span
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: categoryColor }}
                    />
                    <p className="font-bold truncate text-[11px] leading-tight">
                        {isPub ? slot.title || 'Tunnel Publicitaire' : slot.program?.title || slot.title}
                    </p>
                </div>
                {canManageGrid && (
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete(slot.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-600 p-0.5 transition-opacity"
                        title="Retirer de la grille"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                )}
            </div>

            <div className="mt-1 flex items-center justify-between text-[10px] text-slate-500">
                <span className="font-semibold text-slate-600">
                    {startTime} - {endTime}
                </span>
                <span className="px-1.5 py-0.5 rounded bg-slate-100 font-medium">
                    {slot.channel_zone}
                </span>
            </div>

            {slot.episode && (
                <div className="mt-0.5 text-[10px] text-slate-500 truncate">
                    S{slot.episode.season} E{slot.episode.episode_number} : {slot.episode.title}
                </div>
            )}
        </div>
    );
}

// Droppable Grid Day Cell Component
function DayTimeCell({
    dateStr,
    hour,
    slots,
    canManageGrid,
    onDelete,
    onAddSlot,
}: {
    dateStr: string;
    hour: number;
    slots: BroadcastSlot[];
    canManageGrid: boolean;
    onDelete: (id: number) => void;
    onAddSlot: (dateStr: string, hour: number) => void;
}) {
    const droppableId = `${dateStr}T${hour.toString().padStart(2, '0')}:00`;
    const { setNodeRef, isOver } = useDroppable({
        id: droppableId,
        data: { dateStr, hour },
    });

    return (
        <div
            ref={setNodeRef}
            className={`min-h-[72px] border-b border-r border-slate-200 p-1 relative transition-colors ${
                isOver ? 'bg-blue-50/70 border-blue-300' : 'bg-white hover:bg-slate-50/50'
            }`}
        >
            {slots.map((slot) => (
                <DraggableSlotCard
                    key={slot.id}
                    slot={slot}
                    canManageGrid={canManageGrid}
                    onDelete={onDelete}
                />
            ))}

            {canManageGrid && slots.length === 0 && (
                <button
                    onClick={() => onAddSlot(dateStr, hour)}
                    className="w-full h-full opacity-0 hover:opacity-100 flex items-center justify-center text-slate-400 hover:text-blue-600 transition"
                    title="Ajouter un créneau"
                >
                    <Plus className="w-4 h-4" />
                </button>
            )}
        </div>
    );
}

export default function ScheduleIndex({
    slots,
    availablePrograms,
    weekStart,
    weekEnd,
    channelZones,
    canManageGrid,
}: Props) {
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState(weekStart);
    const [selectedHour, setSelectedHour] = useState(20);
    const [selectedMinute, setSelectedMinute] = useState(0);
    const [slotType, setSlotType] = useState<'program' | 'pub'>('program');
    const [selectedProgramId, setSelectedProgramId] = useState<number | ''>(availablePrograms[0]?.id || '');
    const [selectedEpisodeId, setSelectedEpisodeId] = useState<number | ''>('');
    const [selectedZone, setSelectedZone] = useState('Prime Time');
    const [customTitle, setCustomTitle] = useState('');
    const [durationMinutes, setDurationMinutes] = useState(30);
    const [overlapError, setOverlapError] = useState<string | null>(null);

    // Compute the 7 days of the current week
    const weekStartDate = new Date(weekStart);
    const days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(weekStartDate);
        d.setDate(weekStartDate.getDate() + i);
        return {
            dateStr: d.toISOString().split('T')[0],
            dayName: d.toLocaleDateString('fr-FR', { weekday: 'short' }),
            dayNumber: d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
            isToday: d.toDateString() === new Date().toDateString(),
        };
    });

    const navigateWeek = (offsetDays: number) => {
        const newStart = new Date(weekStartDate);
        newStart.setDate(newStart.getDate() + offsetDays);
        router.get(
            route('schedule.index'),
            { start_date: newStart.toISOString().split('T')[0] },
            { preserveState: true }
        );
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || !active) return;

        const slot = active.data.current?.slot as BroadcastSlot;
        const targetDateStr = over.data.current?.dateStr as string;
        const targetHour = over.data.current?.hour as number;

        if (!slot || !targetDateStr || targetHour === undefined) return;

        // Calculate original duration in minutes
        const origStart = new Date(slot.start_datetime);
        const origEnd = new Date(slot.end_datetime);
        const diffMinutes = Math.round((origEnd.getTime() - origStart.getTime()) / (1000 * 60));

        // Create new start & end datetimes preserving minutes or rounding
        const newStart = new Date(`${targetDateStr}T${targetHour.toString().padStart(2, '0')}:00:00`);
        const newEnd = new Date(newStart.getTime() + diffMinutes * 60 * 1000);

        // Format for MySQL datetime: YYYY-MM-DD HH:mm:ss
        const formatDt = (d: Date) => {
            const pad = (n: number) => n.toString().padStart(2, '0');
            return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:00`;
        };

        router.put(
            route('schedule.update', slot.id),
            {
                program_id: slot.program_id,
                episode_id: slot.episode_id,
                slot_type: slot.slot_type,
                title: slot.title,
                channel_zone: slot.channel_zone,
                start_datetime: formatDt(newStart),
                end_datetime: formatDt(newEnd),
            },
            {
                preserveScroll: true,
                onError: (errors) => {
                    const err = errors.start_datetime || 'Impossible de déplacer ce créneau : conflit horaire détecté.';
                    alert(err);
                },
            }
        );
    };

    const handleDeleteSlot = (id: number) => {
        if (confirm('Voulez-vous vraiment retirer ce créneau de la grille ?')) {
            router.delete(route('schedule.destroy', id), { preserveScroll: true });
        }
    };

    const openCreateModal = (dateStr: string, hour: number) => {
        setSelectedDate(dateStr);
        setSelectedHour(hour);
        setSelectedMinute(0);
        setOverlapError(null);

        // Auto determine zone by hour
        if (hour >= 20 && hour < 23) setSelectedZone('Prime Time');
        else if (hour >= 18 && hour < 20) setSelectedZone('Access');
        else if (hour >= 12 && hour < 18) setSelectedZone('Après-midi');
        else if (hour >= 6 && hour < 12) setSelectedZone('Matinée');
        else setSelectedZone('Nuit');

        setCreateModalOpen(true);
    };

    const handleCreateSlot = (e: React.FormEvent) => {
        e.preventDefault();
        setOverlapError(null);

        const pad = (n: number) => n.toString().padStart(2, '0');
        const startStr = `${selectedDate} ${pad(selectedHour)}:${pad(selectedMinute)}:00`;

        const startObj = new Date(`${selectedDate}T${pad(selectedHour)}:${pad(selectedMinute)}:00`);
        const endObj = new Date(startObj.getTime() + durationMinutes * 60 * 1000);
        const endStr = `${endObj.getFullYear()}-${pad(endObj.getMonth() + 1)}-${pad(endObj.getDate())} ${pad(endObj.getHours())}:${pad(endObj.getMinutes())}:00`;

        router.post(
            route('schedule.store'),
            {
                program_id: slotType === 'program' ? selectedProgramId : null,
                episode_id: slotType === 'program' && selectedEpisodeId ? selectedEpisodeId : null,
                slot_type: slotType,
                title: customTitle || (slotType === 'pub' ? 'Tunnel Publicitaire' : null),
                channel_zone: selectedZone,
                start_datetime: startStr,
                end_datetime: endStr,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setCreateModalOpen(false);
                    setCustomTitle('');
                },
                onError: (errs) => {
                    setOverlapError(errs.start_datetime || errs.end_datetime || 'Erreur lors de la planification.');
                },
            }
        );
    };

    const selectedProgram = availablePrograms.find((p) => p.id === Number(selectedProgramId));

    return (
        <AppLayout title="Grille hebdomadaire de diffusion">
            <Head title="Grille de diffusion" />

            <div className="space-y-4">
                {/* Header Controls & Week Navigator */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center space-x-3">
                        <button
                            onClick={() => navigateWeek(-7)}
                            className="p-2 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 transition"
                            title="Semaine précédente"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => navigateWeek(0)}
                            className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold hover:bg-slate-100 text-slate-700 transition"
                        >
                            Aujourd'hui
                        </button>
                        <button
                            onClick={() => navigateWeek(7)}
                            className="p-2 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 transition"
                            title="Semaine suivante"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>

                        <div className="text-sm font-bold text-slate-800 ml-2">
                            Semaine du {new Date(weekStart).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })} au{' '}
                            {new Date(weekEnd).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </div>
                    </div>

                    <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2 text-xs">
                            <span className="inline-flex items-center space-x-1">
                                <span className="w-3 h-3 rounded bg-blue-500 inline-block"></span>
                                <span className="text-slate-600">Émission</span>
                            </span>
                            <span className="inline-flex items-center space-x-1 ml-2">
                                <span className="w-3 h-3 rounded bg-pink-400 inline-block"></span>
                                <span className="text-slate-600">Tunnel Pub</span>
                            </span>
                        </div>

                        {canManageGrid && (
                            <button
                                onClick={() => openCreateModal(days[0].dateStr, 20)}
                                className="inline-flex items-center px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition"
                            >
                                <Plus className="w-4 h-4 mr-1.5" />
                                Planifier un créneau
                            </button>
                        )}
                    </div>
                </div>

                {/* Schedule Grid Table */}
                <DndContext onDragEnd={handleDragEnd}>
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden overflow-x-auto">
                        <div className="min-w-[900px]">
                            {/* Table Day Headers */}
                            <div className="grid grid-cols-8 bg-slate-100 border-b border-slate-200 text-center font-semibold text-xs text-slate-700 sticky top-0 z-10">
                                <div className="p-3 border-r border-slate-200 text-slate-400 uppercase tracking-wider text-[11px]">
                                    Horaire
                                </div>
                                {days.map((day) => (
                                    <div
                                        key={day.dateStr}
                                        className={`p-2.5 border-r border-slate-200 last:border-r-0 ${
                                            day.isToday ? 'bg-blue-50/80 text-blue-800' : ''
                                        }`}
                                    >
                                        <span className="capitalize">{day.dayName}</span>
                                        <div className="text-[11px] font-normal text-slate-500">{day.dayNumber}</div>
                                    </div>
                                ))}
                            </div>

                            {/* Hour Rows */}
                            <div className="divide-y divide-slate-200">
                                {HOURS.map((hour) => (
                                    <div key={hour} className="grid grid-cols-8">
                                        {/* Time Label Column */}
                                        <div className="p-2 border-r border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-500 text-center flex items-center justify-center">
                                            {hour.toString().padStart(2, '0')}:00
                                        </div>

                                        {/* 7 Days Cells */}
                                        {days.map((day) => {
                                            // Find slots that start in this day and hour
                                            const cellSlots = slots.filter((s) => {
                                                const sDate = new Date(s.start_datetime);
                                                const slotDateStr = sDate.toISOString().split('T')[0];
                                                return slotDateStr === day.dateStr && sDate.getHours() === hour;
                                            });

                                            return (
                                                <DayTimeCell
                                                    key={`${day.dateStr}-${hour}`}
                                                    dateStr={day.dateStr}
                                                    hour={hour}
                                                    slots={cellSlots}
                                                    canManageGrid={canManageGrid}
                                                    onDelete={handleDeleteSlot}
                                                    onAddSlot={openCreateModal}
                                                />
                                            );
                                        })}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </DndContext>
            </div>

            {/* Modal: Planifier un créneau */}
            {createModalOpen && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 border border-slate-200">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <h3 className="font-bold text-slate-800 text-base">Planifier un créneau de diffusion</h3>
                            <button
                                onClick={() => setCreateModalOpen(false)}
                                className="text-slate-400 hover:text-slate-600 p-1"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {overlapError && (
                            <div className="mt-3 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center space-x-2">
                                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                                <span>{overlapError}</span>
                            </div>
                        )}

                        <form onSubmit={handleCreateSlot} className="mt-4 space-y-4">
                            <div className="flex rounded-lg bg-slate-100 p-1">
                                <button
                                    type="button"
                                    onClick={() => setSlotType('program')}
                                    className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition ${
                                        slotType === 'program' ? 'bg-white shadow-sm text-blue-700' : 'text-slate-600'
                                    }`}
                                >
                                    Programme Validé
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setSlotType('pub')}
                                    className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition ${
                                        slotType === 'pub' ? 'bg-white shadow-sm text-pink-700' : 'text-slate-600'
                                    }`}
                                >
                                    Tunnel Publicitaire
                                </button>
                            </div>

                            {slotType === 'program' ? (
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                                            Choisir un programme validé
                                        </label>
                                        <select
                                            value={selectedProgramId}
                                            onChange={(e) => {
                                                const id = Number(e.target.value);
                                                setSelectedProgramId(id);
                                                const p = availablePrograms.find((item) => item.id === id);
                                                if (p) setDurationMinutes(p.duration_minutes);
                                            }}
                                            className="w-full text-xs rounded-lg border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                                            required
                                        >
                                            {availablePrograms.map((p) => (
                                                <option key={p.id} value={p.id}>
                                                    {p.title} ({p.duration_minutes} min - {p.category?.name})
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {selectedProgram?.episodes && selectedProgram.episodes.length > 0 && (
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                                                Épisode (optionnel)
                                            </label>
                                            <select
                                                value={selectedEpisodeId}
                                                onChange={(e) => setSelectedEpisodeId(e.target.value ? Number(e.target.value) : '')}
                                                className="w-full text-xs rounded-lg border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                                            >
                                                <option value="">Aucun / Émission globale</option>
                                                {selectedProgram.episodes.map((ep) => (
                                                    <option key={ep.id} value={ep.id}>
                                                        S{ep.season} E{ep.episode_number} : {ep.title}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                                        Titre du tunnel pub
                                    </label>
                                    <input
                                        type="text"
                                        value={customTitle}
                                        onChange={(e) => setCustomTitle(e.target.value)}
                                        placeholder="Ex: Écran Pub Prime Time - Sponsor Inwi"
                                        className="w-full text-xs rounded-lg border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                                    />
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">Date</label>
                                    <input
                                        type="date"
                                        value={selectedDate}
                                        onChange={(e) => setSelectedDate(e.target.value)}
                                        className="w-full text-xs rounded-lg border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">Tranche Antenne</label>
                                    <select
                                        value={selectedZone}
                                        onChange={(e) => setSelectedZone(e.target.value)}
                                        className="w-full text-xs rounded-lg border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                                    >
                                        {channelZones.map((z) => (
                                            <option key={z} value={z}>
                                                {z}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">Heure</label>
                                    <input
                                        type="number"
                                        min={0}
                                        max={23}
                                        value={selectedHour}
                                        onChange={(e) => setSelectedHour(Number(e.target.value))}
                                        className="w-full text-xs rounded-lg border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">Minute</label>
                                    <input
                                        type="number"
                                        min={0}
                                        max={59}
                                        step={5}
                                        value={selectedMinute}
                                        onChange={(e) => setSelectedMinute(Number(e.target.value))}
                                        className="w-full text-xs rounded-lg border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">Durée (min)</label>
                                    <input
                                        type="number"
                                        min={5}
                                        max={240}
                                        value={durationMinutes}
                                        onChange={(e) => setDurationMinutes(Number(e.target.value))}
                                        className="w-full text-xs rounded-lg border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
                                <button
                                    type="button"
                                    onClick={() => setCreateModalOpen(false)}
                                    className="px-3.5 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition"
                                >
                                    Confirmer la programmation
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
