<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\UpdateSettingsRequest;
use App\Models\Setting;

class SettingController extends Controller
{
    /**
     * Public: the storefront reads this (no auth) to show customers where
     * to email their design files, and to build the mailto: link. Only
     * ever exposes the small whitelist of settings that are safe to be
     * public — never dump the whole `settings` table here.
     */
    public function index()
    {
        return response()->json([
            'status' => 'success',
            'data' => [
                'design_submission_email' => Setting::designSubmissionEmail(),
                'hide_prices' => Setting::hidePrices(),
            ],
        ]);
    }

    /**
     * Admin/staff only: update one or more settings from this whitelist.
     */
    public function update(UpdateSettingsRequest $request)
    {
        if ($request->has('design_submission_email')) {
            $value = $request->validated('design_submission_email');
            Setting::set('design_submission_email', $value ?: Setting::DESIGN_SUBMISSION_EMAIL_DEFAULT);
        }

        if ($request->has('hide_prices')) {
            Setting::set('hide_prices', $request->boolean('hide_prices') ? '1' : '0');
        }

        return response()->json([
            'status' => 'success',
            'data' => [
                'design_submission_email' => Setting::designSubmissionEmail(),
                'hide_prices' => Setting::hidePrices(),
            ],
        ]);
    }
}
