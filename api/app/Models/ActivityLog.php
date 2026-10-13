<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

/** One line in an inquiry's or order's timeline. See the migration for what it stores. */
class ActivityLog extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'user_id', 'user_name', 'user_role', 'action', 'from_value', 'to_value', 'note',
    ];

    protected function casts(): array
    {
        return ['created_at' => 'datetime'];
    }

    public function subject(): MorphTo
    {
        return $this->morphTo();
    }

    public static function record(Model $subject, string $action, ?User $by, array $details = []): self
    {
        $entry = new self(array_merge($details, [
            'action' => $action,
            'user_id' => $by?->id,
            'user_name' => $by?->name,
            // The role's name at the time ("Sales"), so the history keeps reading
            // correctly even if the role is later renamed or deleted.
            'user_role' => $by?->role_name,
        ]));
        $entry->created_at = now();
        $entry->subject()->associate($subject);
        $entry->save();

        return $entry;
    }
}
