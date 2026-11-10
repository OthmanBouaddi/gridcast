<?php

use App\Http\Controllers\AdvertiserController;
use App\Http\Controllers\AdvertisingSlotController;
use App\Http\Controllers\AudienceReportController;
use App\Http\Controllers\BroadcastSlotController;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\EpisodeController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ProgramController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return redirect()->route('dashboard');
});

Route::middleware(['auth'])->group(function () {
    // Dashboard with Recharts analytics
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // AI Chatbot
    Route::post('/chat', [ChatController::class, 'send'])->name('chat.send');

    // Program management
    Route::get('/validation', [ProgramController::class, 'validationQueue'])
        ->name('validation.index')
        ->middleware('role:programmation');

    Route::post('/programs/{program}/status', [ProgramController::class, 'changeStatus'])
        ->name('programs.status');

    Route::resource('programs', ProgramController::class);

    // Episode management
    Route::post('/episodes', [EpisodeController::class, 'store'])->name('episodes.store');
    Route::put('/episodes/{episode}', [EpisodeController::class, 'update'])->name('episodes.update');
    Route::delete('/episodes/{episode}', [EpisodeController::class, 'destroy'])->name('episodes.destroy');

    // Schedule grid (Weekly calendar with dnd-kit drag-and-drop)
    Route::get('/schedule', [BroadcastSlotController::class, 'index'])->name('schedule.index');
    Route::post('/schedule', [BroadcastSlotController::class, 'store'])
        ->name('schedule.store')
        ->middleware('role:programmation');
    Route::put('/schedule/{broadcast_slot}', [BroadcastSlotController::class, 'update'])
        ->name('schedule.update')
        ->middleware('role:programmation');
    Route::delete('/schedule/{broadcast_slot}', [BroadcastSlotController::class, 'destroy'])
        ->name('schedule.destroy')
        ->middleware('role:programmation');

    // Advertising management (Régie publicitaire)
    Route::middleware('role:regie')->group(function () {
        Route::get('/advertising', [AdvertisingSlotController::class, 'index'])->name('advertising.index');
        Route::post('/advertising/slots', [AdvertisingSlotController::class, 'store'])->name('advertising.slots.store');
        Route::put('/advertising/slots/{advertising_slot}', [AdvertisingSlotController::class, 'update'])->name('advertising.slots.update');
        Route::delete('/advertising/slots/{advertising_slot}', [AdvertisingSlotController::class, 'destroy'])->name('advertising.slots.destroy');
        Route::post('/advertising/slots/{advertising_slot}/notify', [AdvertisingSlotController::class, 'notifyUpcoming'])->name('advertising.slots.notify');

        Route::post('/advertisers', [AdvertiserController::class, 'store'])->name('advertisers.store');
        Route::put('/advertisers/{advertiser}', [AdvertiserController::class, 'update'])->name('advertisers.update');
        Route::delete('/advertisers/{advertiser}', [AdvertiserController::class, 'destroy'])->name('advertisers.destroy');
    });

    // Audience reports (manual and CSV import)
    Route::post('/audience-reports', [AudienceReportController::class, 'store'])->name('audience-reports.store');
    Route::delete('/audience-reports/{audience_report}', [AudienceReportController::class, 'destroy'])->name('audience-reports.destroy');

    // Notifications
    Route::get('/notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::post('/notifications/{id}/read', [NotificationController::class, 'markAsRead'])->name('notifications.read');
    Route::post('/notifications/read-all', [NotificationController::class, 'markAllAsRead'])->name('notifications.readAll');

    // Profile
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__ . '/auth.php';
