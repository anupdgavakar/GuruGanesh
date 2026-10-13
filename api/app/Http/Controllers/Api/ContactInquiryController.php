<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Inquiries\ContactInquiryRequest;
use App\Http\Requests\Inquiries\UpdateInquiryStatusRequest;
use App\Models\ContactInquiry;
use Illuminate\Http\Request;

class ContactInquiryController extends Controller
{
    /**
     * Public: submit the contact form. Rate-limited at the route level —
     * this holds customer-provided PII, so unlike the catalog resources it
     * has no public index/show, only this write endpoint.
     */
    public function store(ContactInquiryRequest $request)
    {
        $inquiry = ContactInquiry::create($request->safe()->except('website'));

        return response()->json([
            'status' => 'success',
            'message' => "Thanks — we'll get back to you soon.",
            'data' => ['id' => $inquiry->id],
        ], 201);
    }

    /**
     * Team only: the inbox. Newest first, optionally filtered by status and
     * by who is handling it (?assigned_to=me | none | <user id>).
     */
    public function index(Request $request)
    {
        $query = ContactInquiry::query()->with('assignee:id,name,role')->latest();

        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }

        if ($request->filled('assigned_to')) {
            $handler = (string) $request->string('assigned_to');
            match (true) {
                $handler === 'none' => $query->whereNull('assigned_to'),
                $handler === 'me' => $query->where('assigned_to', $request->user()->id),
                ctype_digit($handler) => $query->where('assigned_to', (int) $handler),
                default => null,
            };
        }

        return response()->json(['status' => 'success', 'data' => $query->paginate(20)]);
    }

    public function show(Request $request, ContactInquiry $inquiry)
    {
        // Whoever opens an unassigned request first becomes its handler. An
        // admin only looking around does not take it (they'd end up owning
        // everything); admins take a request by changing it or assigning it.
        if (! $request->user()->isAdmin()) {
            $inquiry->claimFor($request->user());
        }

        // Team only, so the product comes back with its real price — a price
        // that is hidden from customers on the website is still shown here.
        $inquiry->load('product.category', 'product.images', 'assignee:id,name,role', 'activities');

        return response()->json(['status' => 'success', 'data' => $inquiry]);
    }

    public function updateStatus(UpdateInquiryStatusRequest $request, ContactInquiry $inquiry)
    {
        $inquiry->changeStatus($request->validated('status'), $request->user());

        return response()->json([
            'status' => 'success',
            'data' => $inquiry->fresh(['assignee:id,name,role', 'activities']),
        ]);
    }

    public function destroy(ContactInquiry $inquiry)
    {
        $inquiry->delete();

        return response()->json(['status' => 'success', 'message' => 'Inquiry deleted.']);
    }
}
