<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Inquiries\ContactInquiryRequest;
use App\Http\Requests\Inquiries\UpdateInquiryStatusRequest;
use App\Models\ContactInquiry;

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
     * Admin only: the inbox. Newest first, optionally filtered by status.
     */
    public function index()
    {
        $query = ContactInquiry::query()->latest();

        if (request()->filled('status')) {
            $query->where('status', request()->string('status'));
        }

        return response()->json(['status' => 'success', 'data' => $query->paginate(20)]);
    }

    public function show(ContactInquiry $inquiry)
    {
        return response()->json(['status' => 'success', 'data' => $inquiry]);
    }

    public function updateStatus(UpdateInquiryStatusRequest $request, ContactInquiry $inquiry)
    {
        $inquiry->update($request->validated());

        return response()->json(['status' => 'success', 'data' => $inquiry->fresh()]);
    }

    public function destroy(ContactInquiry $inquiry)
    {
        $inquiry->delete();

        return response()->json(['status' => 'success', 'message' => 'Inquiry deleted.']);
    }
}
