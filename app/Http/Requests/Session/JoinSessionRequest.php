<?php

namespace App\Http\Requests\Session;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class JoinSessionRequest extends FormRequest
{
    /**
     * Authorization is delegated to OpenPlaySessionPolicy@join via the route's
     * resolved {session} parameter.
     */
    public function authorize(): bool
    {
        $session = $this->route('session');

        return $session !== null && ($this->user()?->can('join', $session) ?? false);
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [];
    }
}
