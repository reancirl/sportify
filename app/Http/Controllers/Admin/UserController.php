<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->string('search')->toString();

        $users = User::query()
            ->with('roles:id,name')
            ->when($search !== '', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            })
            ->orderBy('name')
            ->paginate(25)
            ->withQueryString();

        // Flatten Spatie Role objects to a string[] so the frontend (typed as
        // `roles?: string[]`) can render role labels directly.
        $users->through(function (User $user) {
            $data = $user->toArray();
            $data['roles'] = $user->getRoleNames()->all();

            return $data;
        });

        return Inertia::render('admin/users/index', [
            'users' => $users,
            'filters' => [
                'search' => $search ?: null,
            ],
        ]);
    }
}
