<?php

namespace App\Http\Controllers;

use App\Models\PreoperationalQuestion;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PreoperationalQuestionController extends Controller
{
    public function index()
    {
        return Inertia::render('Reports/Questions', [
            'questions' => PreoperationalQuestion::orderBy('order')->get()
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'category' => 'required|string',
            'label' => 'required|string',
            'key' => 'required|string|unique:preoperational_questions,key',
            'type' => 'required|in:boolean,text',
            'order' => 'required|integer',
            'active' => 'boolean',
        ]);

        PreoperationalQuestion::create($validated);

        return back()->with('success', 'Pregunta creada con éxito');
    }

    public function update(Request $request, PreoperationalQuestion $question)
    {
        $validated = $request->validate([
            'category' => 'required|string',
            'label' => 'required|string',
            'key' => 'required|string|unique:preoperational_questions,key,' . $question->id,
            'type' => 'required|in:boolean,text',
            'order' => 'required|integer',
            'active' => 'boolean',
        ]);

        $question->update($validated);

        return back()->with('success', 'Pregunta actualizada con éxito');
    }

    public function destroy(PreoperationalQuestion $question)
    {
        $question->delete();
        return back()->with('success', 'Pregunta eliminada con éxito');
    }
}