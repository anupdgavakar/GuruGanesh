<?php

namespace App\Models;

use App\Enums\UserRole;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'google_id',
        'avatar',
        'phone',
        'company_name',
        'gst_number',
        'address',
        'city',
        'state',
        'pincode',
        // 'role' is deliberately NOT mass assignable — it must only ever be set
        // by trusted server-side code (seeders, an admin-only endpoint), never
        // from a user-supplied request payload.
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

    /** What this account may do — the admin panel uses it to build its menu. */
    protected $appends = ['permissions', 'role_name'];

    /**
     * The attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'phone_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
        ];
    }

    /**
     * `role` is the short key of a row in the roles table ("admin", "sales",
     * or a custom one). Writing a UserRole case is accepted for the built-ins.
     */
    protected function role(): Attribute
    {
        return Attribute::make(
            get: fn (?string $value) => $value,
            set: fn ($value) => $value instanceof \BackedEnum ? $value->value : $value,
        );
    }

    public function isAdmin(): bool
    {
        return $this->role === UserRole::Admin->value;
    }

    public function isStaff(): bool
    {
        return $this->role === UserRole::Staff->value;
    }

    public function isCustomer(): bool
    {
        return $this->role === UserRole::Customer->value;
    }

    /** Can edit the product catalog (and see inactive items on the public lists). */
    public function canManageCatalog(): bool
    {
        return $this->hasPermission(UserRole::PERM_CATALOG);
    }

    /** Anyone who works in the admin panel — every account that is not a customer. */
    public function isTeam(): bool
    {
        return $this->role !== null && $this->role !== UserRole::Customer->value;
    }

    public function hasPermission(string $permission): bool
    {
        return $this->is_active !== false && in_array($permission, Role::permissionsFor($this->role), true);
    }

    /** What this account may do — the admin panel uses it to build its menu. */
    protected function permissions(): Attribute
    {
        return Attribute::get(fn () => $this->is_active === false ? [] : Role::permissionsFor($this->role));
    }

    /** The role's display name, e.g. "Sales". */
    protected function roleName(): Attribute
    {
        return Attribute::get(fn () => Role::nameFor($this->role));
    }

    public function assignedInquiries(): HasMany
    {
        return $this->hasMany(ContactInquiry::class, 'assigned_to');
    }

    public function assignedOrders(): HasMany
    {
        return $this->hasMany(Order::class, 'assigned_to');
    }

    /**
     * A phone-only customer account (see OtpAuthController) still needs
     * SOME value in `email`, which stays required+unique for admin/staff
     * login — this gives it a deterministic, never-shown placeholder
     * instead of loosening that column. Derived from the (already unique)
     * normalized phone, so it's automatically unique too.
     */
    public static function syntheticEmailForPhone(string $phone): string
    {
        $digits = preg_replace('/\D/', '', $phone);

        return "{$digits}@phone.guruganeshgraphics.local";
    }
}
