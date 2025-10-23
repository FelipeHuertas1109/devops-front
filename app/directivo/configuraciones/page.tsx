'use client';

import React, { useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import Navbar from '../../../components/Navbar';
import DirectivoConfiguraciones from '../../../components/DirectivoConfiguraciones';

export default function ConfiguracionesPage() {
  const { user, token } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!token || !user) {
      router.push('/');
    } else if (user.tipo_usuario !== 'DIRECTIVO') {
      router.push('/');
    }
  }, [user, token, router]);

  if (!user || user.tipo_usuario !== 'DIRECTIVO') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <DirectivoConfiguraciones />
        </div>
      </main>
    </div>
  );
}

