<?php

namespace App\Models\Concerns;

use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphMany;

/**
 * "Who is handling this?" for contact inquiries and orders: a handler, plus
 * a timeline of everything the team did to it.
 */
trait HasHandler
{
    public function assignee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function activities(): MorphMany
    {
        return $this->morphMany(ActivityLog::class, 'subject')->orderBy('id');
    }

    /**
     * Make $user the handler, but only if nobody is yet — a single UPDATE
     * with the "still unassigned" condition, so two people opening the same
     * request at the same moment can't both win. Returns true if $user got it.
     */
    public function claimFor(User $user): bool
    {
        if ($this->assigned_to !== null) {
            return false;
        }

        $won = static::query()
            ->whereKey($this->getKey())
            ->whereNull('assigned_to')
            ->update(['assigned_to' => $user->id, 'assigned_at' => now()]);

        if (! $won) {
            return false;
        }

        $this->forceFill(['assigned_to' => $user->id, 'assigned_at' => now()])->syncOriginal();
        ActivityLog::record($this, 'claimed', $user, ['to_value' => $user->name]);

        return true;
    }

    /** Hand the request to $user (or to nobody), recording who did it. */
    public function assignTo(?User $user, User $by): void
    {
        $previous = $this->assignee?->name;

        if ($this->assigned_to === $user?->id) {
            return;
        }

        $this->forceFill([
            'assigned_to' => $user?->id,
            'assigned_at' => $user ? now() : null,
        ])->save();

        ActivityLog::record($this, $user ? 'assigned' : 'unassigned', $by, [
            'from_value' => $previous,
            'to_value' => $user?->name,
        ]);

        $this->unsetRelation('assignee');
    }

    /** Change status, recording who did it, and take the request if nobody has it yet. */
    public function changeStatus(string $status, User $by): void
    {
        $previous = $this->status;

        if ($previous !== $status) {
            $this->update(['status' => $status]);
            ActivityLog::record($this, 'status_changed', $by, ['from_value' => $previous, 'to_value' => $status]);
        }

        $this->claimFor($by);
    }

    public function addNote(string $note, User $by): ActivityLog
    {
        return ActivityLog::record($this, 'note', $by, ['note' => $note]);
    }
}
