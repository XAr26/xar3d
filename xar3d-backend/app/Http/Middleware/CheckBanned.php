<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckBanned
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->user() && $request->user()->is_banned) {
            // Optional: revoke token so they have to log in again if unbanned
            $request->user()->currentAccessToken()?->delete();
            
            return response()->json([
                'message' => 'Akun Anda telah ditangguhkan (Banned). Silakan hubungi admin.'
            ], 403);
        }

        return $next($request);
    }
}
