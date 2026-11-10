<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory;
    use Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function isProgrammation(): bool
    {
        return $this->role === 'programmation' || $this->role === 'admin';
    }

    public function isProducteur(): bool
    {
        return $this->role === 'producteur' || $this->role === 'admin';
    }

    public function isRegie(): bool
    {
        return $this->role === 'regie' || $this->role === 'admin';
    }

    public function programs(): HasMany
    {
        return $this->hasMany(Program::class, 'producer_id');
    }

    public function broadcastSlots(): HasMany
    {
        return $this->hasMany(BroadcastSlot::class, 'created_by');
    }
}
