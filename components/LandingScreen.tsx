"use client";

import { SignInButton, SignUpButton } from "@clerk/nextjs";

export default function LandingScreen() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-gray-900 px-4">
      <div className="w-full max-w-md text-center">
        <h1 className="text-4xl font-bold tracking-tight mb-3">AI Spec Builder</h1>
        <p className="text-gray-500 text-sm mb-10 leading-relaxed">
          Convertí tu idea de negocio en una especificación técnica completa en minutos.
        </p>

        <div className="flex flex-col gap-3">
          <SignInButton mode="modal">
            <button className="w-full rounded-2xl bg-indigo-600 px-6 py-3.5 font-semibold text-white transition-colors hover:bg-indigo-500">
              Iniciar sesión
            </button>
          </SignInButton>

          <SignUpButton mode="modal">
            <button className="w-full rounded-2xl border border-gray-300 bg-white px-6 py-3.5 font-semibold text-gray-700 transition-colors hover:bg-gray-50">
              Crear cuenta
            </button>
          </SignUpButton>
        </div>

        <p className="mt-8 text-xs text-gray-400">
          Necesitás una cuenta para generar y guardar tus especificaciones.
        </p>
      </div>
    </main>
  );
}
