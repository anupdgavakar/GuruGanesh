<?php

namespace App\Http\Controllers\Api;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\Team\AssignRequest;
use App\Http\Requests\Team\NoteRequest;
use App\Models\ContactInquiry;
use App\Models\Order;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Validation\ValidationException;

/**
 * Assigning a handler and leaving notes on inquiries and orders. The
 * automatic "first person to open it takes it" lives on the show() actions.
 */
class HandlingController extends Controller
{
    /** Active team members who can be given a request, for the "handled by" dropdown. */
    public function team(Request $request)
    {
        $permission = $request->query('for') === 'orders' ? UserRole::PERM_ORDERS : UserRole::PERM_INQUIRIES;

        $people = User::query()
            ->where('role', '!=', UserRole::Customer->value)
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'role'])
            ->filter(fn (User $user) => $user->hasPermission($permission))
            ->values();

        return response()->json(['status' => 'success', 'data' => $people]);
    }

    public function assignInquiry(AssignRequest $request, ContactInquiry $inquiry)
    {
        return $this->assign($request, $inquiry, UserRole::PERM_INQUIRIES);
    }

    public function assignOrder(AssignRequest $request, Order $order)
    {
        return $this->assign($request, $order, UserRole::PERM_ORDERS);
    }

    public function noteInquiry(NoteRequest $request, ContactInquiry $inquiry)
    {
        return $this->note($request, $inquiry);
    }

    public function noteOrder(NoteRequest $request, Order $order)
    {
        return $this->note($request, $order);
    }

    private function assign(AssignRequest $request, Model $record, string $permission)
    {
        $person = null;

        if ($request->filled('user_id')) {
            $person = User::findOrFail($request->integer('user_id'));

            if (! $person->isTeam() || ! $person->is_active || ! $person->hasPermission($permission)) {
                throw ValidationException::withMessages([
                    'user_id' => "{$person->name} can't work on this kind of request.",
                ]);
            }
        }

        $record->assignTo($person, $request->user());

        return response()->json([
            'status' => 'success',
            'data' => $record->fresh(['assignee:id,name,role', 'activities']),
        ]);
    }

    private function note(NoteRequest $request, Model $record)
    {
        $record->addNote($request->validated('note'), $request->user());

        return response()->json([
            'status' => 'success',
            'data' => $record->fresh(['assignee:id,name,role', 'activities']),
        ], 201);
    }
}
