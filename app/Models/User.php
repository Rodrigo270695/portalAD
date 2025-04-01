<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasRoles;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'dni',
        'email',
        'password',
        'cel',
        'zonificado_id',
        'circuit_id',
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

    /**
     * Get the login username to be used by the controller.
     *
     * @return string
     */
    public function username()
    {
        return 'dni';
    }

    /**
     * Get the circuit that the user belongs to.
     */
    public function circuit()
    {
        return $this->belongsTo(Circuit::class);
    }

    /**
     * Get the zonificador (supervisor) that the user belongs to.
     */
    public function zonificador()
    {
        return $this->belongsTo(User::class, 'zonificado_id');
    }

    /**
     * Get the users that belong to this zonificador (supervisor).
     */
    public function zonificados()
    {
        return $this->hasMany(User::class, 'zonificado_id');
    }

    /**
     * Get the sellers that belong to this user.
     */
    public function sellers()
    {
        return $this->hasMany(Seller::class);
    }
}
