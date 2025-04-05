<?php

namespace App\Http\Controllers;

use App\Http\Requests\UserRequest;
use App\Models\User;
use App\Models\Circuit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        // Obtener parámetros de la solicitud
        $search = $request->input('search');
        $perPage = $request->input('per_page', 10);
        $page = $request->input('page', 1);

        // Validar que perPage sea uno de los valores permitidos
        $allowedPerPage = [10, 20, 50, 100];
        $perPage = in_array((int)$perPage, $allowedPerPage) ? (int)$perPage : 10;

        $users = User::with(['circuit.zonal', 'zonificador', 'roles'])
            ->when($search, function ($query) use ($search) {
                return $query->where('name', 'like', "%{$search}%")
                    ->orWhere('dni', 'like', "%{$search}%")
                    ->orWhere('cel', 'like', "%{$search}%")
                    ->orWhereHas('circuit', function ($query) use ($search) {
                        $query->where('name', 'like', "%{$search}%");
                    })
                    ->orWhereHas('roles', function ($query) use ($search) {
                        $query->where('name', 'like', "%{$search}%");
                    });
            })
            ->orderBy('name')
            ->paginate($perPage, ['*'], 'page', $page)
            ->withQueryString();

        // Cargar circuitos con su zonal relacionado
        $circuits = Circuit::with('zonal:id,short_name')
            ->where('active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'zonal_id']);
        $zonificadores = User::whereHas('roles', function ($query) {
            $query->where('name', 'zonificado');
        })->orderBy('name')->get(['id', 'name', 'dni']);
        $roles = Role::orderBy('name')->get(['id', 'name']);

        return Inertia::render('User/Index', [
            'users' => $users,
            'circuits' => $circuits,
            'zonificadores' => $zonificadores,
            'roles' => $roles,
            'filters' => [
                'search' => $search,
                'page' => $page,
                'per_page' => $perPage,
            ],
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function bulkCreate(Request $request)
    {
        $request->validate([
            'dnis' => ['required', 'array'],
            'dnis.*' => ['required', 'string', 'min:1', 'max:8'],
        ]);

        $circuit = Circuit::where('name', 'SINNOMBRE')->first();
        if (!$circuit) {
            return response()->json(['message' => 'No se encontró el circuito SINNOMBRE'], 400);
        }

        $results = [
            'total' => 0,
            'success' => 0,
            'errors' => [],
        ];

        foreach ($request->dnis as $dni) {
            $results['total']++;
            try {
                // Asegurar que el DNI tenga 8 dígitos
                $dni = str_pad($dni, 8, '0', STR_PAD_LEFT);

                // Verificar si el usuario ya existe
                if (User::where('dni', $dni)->exists()) {
                    throw new \Exception('El usuario ya existe');
                }

                // Crear el usuario
                $user = User::create([
                    'name' => 'sin nombre',
                    'email' => null,
                    'dni' => $dni,
                    'password' => Hash::make($dni),
                    'cel' => '999999999',
                    'circuit_id' => $circuit->id,
                ]);

                // Asignar rol pdv
                $user->assignRole('pdv');

                $results['success']++;
            } catch (\Exception $e) {
                $results['errors'][] = [
                    'dni' => $dni,
                    'message' => $e->getMessage(),
                ];
            }
        }

        if (empty($results['errors'])) {
            return back()->with([
                'success' => 'Se crearon ' . $results['success'] . ' usuarios correctamente',
                'results' => $results
            ]);
        } else {
            return back()->with([
                'error' => 'Se encontraron errores al crear algunos usuarios',
                'results' => $results
            ]);
        }
    }

    public function store(UserRequest $request)
    {
        $validated = $request->safe()->only([
            'name',
            'dni',
            'cel',
            'password',
            'circuit_id',
            'zonificado_id',
            'role',
            'active'
        ]);
        
        // Encriptar la contraseña
        $validated['password'] = Hash::make($validated['password']);
        
        // Crear el usuario
        $user = User::create($validated);
        
        // Asignar rol
        if (isset($validated['role'])) {
            $user->assignRole($validated['role']);
        }

        if ($request->wantsJson()) {
            return response()->json(['message' => 'Usuario creado correctamente']);
        }

        return to_route('users.index');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UserRequest $request, User $user)
    {
        $validated = $request->safe()->only([
            'name',
            'dni',
            'cel',
            'password',
            'circuit_id',
            'zonificado_id',
            'role',
            'active'
        ]);
        
        // Solo actualizar la contraseña si se proporciona
        if (isset($validated['password']) && $validated['password']) {
            $validated['password'] = Hash::make($validated['password']);
        } else {
            unset($validated['password']);
        }
        
        $user->update($validated);
        
        // Actualizar roles
        if (isset($validated['role'])) {
            $user->syncRoles([$validated['role']]);
        }

        if ($request->wantsJson()) {
            return response()->json(['message' => 'Usuario actualizado correctamente']);
        }

        return to_route('users.index');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(User $user)
    {
        $user->delete();
        return to_route('users.index');
    }
}
