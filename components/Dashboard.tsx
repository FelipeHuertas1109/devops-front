'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const isDirectivo = user?.tipo_usuario === 'DIRECTIVO';
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [cardOrder, setCardOrder] = useState<number[]>([]);

  // Definir las tarjetas de directivo (solo funcionalidades del Laboratorio I)
  const directivoCards = [
    { 
      id: 0, 
      href: '/directivo/horarios', 
      title: 'Ver Horarios', 
      description: 'Consultar todos los horarios de monitores', 
      color: 'blue', 
      icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' 
    },
    { 
      id: 1, 
      href: '/directivo/ajustes-horas', 
      title: 'Ajustes de Horas', 
      description: 'Dar o quitar horas manualmente', 
      color: 'amber', 
      icon: 'M12 8c1.657 0 3-1.343 3-3S13.657 2 12 2 9 3.343 9 5s1.343 3 3 3zm0 2c-2.21 0-4 1.79-4 4v6h8v-6c0-2.21-1.79-4-4-4z' 
    },
    { 
      id: 2, 
      href: '/directivo/configuraciones', 
      title: 'Configuraciones', 
      description: 'Administrar configuraciones del sistema', 
      color: 'purple', 
      icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' 
    }
  ];

  // Inicializar orden de tarjetas
  useEffect(() => {
    if (isDirectivo && cardOrder.length === 0) {
      // Intentar cargar orden guardado desde localStorage
      const savedOrder = localStorage.getItem('dashboard-card-order');
      if (savedOrder) {
        try {
          const parsedOrder = JSON.parse(savedOrder);
          // Verificar que el orden guardado sea válido
          if (Array.isArray(parsedOrder) && parsedOrder.length === directivoCards.length) {
            setCardOrder(parsedOrder);
          } else {
            setCardOrder(directivoCards.map(card => card.id));
          }
        } catch {
          setCardOrder(directivoCards.map(card => card.id));
        }
      } else {
        setCardOrder(directivoCards.map(card => card.id));
      }
    }
  }, [isDirectivo, cardOrder.length]);

  // Guardar orden cuando cambie
  useEffect(() => {
    if (isDirectivo && cardOrder.length > 0) {
      localStorage.setItem('dashboard-card-order', JSON.stringify(cardOrder));
    }
  }, [cardOrder, isDirectivo]);

  // Funciones de drag and drop
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', '');
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      return;
    }

    const newOrder = [...cardOrder];
    const draggedItem = newOrder[draggedIndex];
    
    // Remover el elemento arrastrado
    newOrder.splice(draggedIndex, 1);
    
    // Insertar en la nueva posición
    newOrder.splice(dropIndex, 0, draggedItem);
    
    setCardOrder(newOrder);
    setDraggedIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  // Función para renderizar una tarjeta
  const renderCard = (card: typeof directivoCards[0], index: number) => {
    const colorClasses = {
      blue: 'border-blue-500 bg-blue-100 text-blue-600',
      amber: 'border-amber-500 bg-amber-100 text-amber-600',
      purple: 'border-purple-500 bg-purple-100 text-purple-600'
    };

    return (
      <Link key={card.id} href={card.href} className="block">
        <div 
          draggable
          onDragStart={(e) => handleDragStart(e, index)}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, index)}
          onDragEnd={handleDragEnd}
          className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 p-4 sm:p-6 border-l-4 cursor-move h-32 flex flex-col justify-between ${
            draggedIndex === index 
              ? 'opacity-50 scale-95 shadow-lg' 
              : 'hover:scale-[1.01]'
          }`}
          style={{ borderLeftColor: `var(--${card.color}-500)` }}
        >
          <div className="flex items-center">
            <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${colorClasses[card.color as keyof typeof colorClasses]}`}>
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={card.icon} />
              </svg>
            </div>
            <div className="ml-3 sm:ml-4 min-w-0 flex-1">
              <h3 className="text-base sm:text-lg font-medium text-gray-900 truncate">{card.title}</h3>
              <p className="text-xs sm:text-sm text-gray-500 mt-1 line-clamp-2">{card.description}</p>
            </div>
          </div>
          <div className="mt-auto">
            <span className={`inline-flex items-center text-xs sm:text-sm font-medium ${colorClasses[card.color as keyof typeof colorClasses].split(' ')[2]}`}>
              Acceder
              <svg className="ml-1 w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </span>
          </div>
        </div>
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
            {/* Welcome Card */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-4 sm:p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-3 sm:ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-xs sm:text-sm font-medium text-gray-500 truncate">Estado</dt>
                      <dd className="text-base sm:text-lg font-medium text-gray-900">Conectado</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            {/* User Info Card */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-4 sm:p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-3 sm:ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-xs sm:text-sm font-medium text-gray-500 truncate">Usuario</dt>
                      <dd className="text-base sm:text-lg font-medium text-gray-900 truncate">{user?.username}</dd>
                      <dt className="text-xs sm:text-sm font-medium text-gray-500 truncate mt-1">Tipo</dt>
                      <dd className="text-xs sm:text-sm font-medium text-blue-600">{user?.tipo_usuario_display}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            {/* Placeholder para tercera columna en lg */}
            <div className="hidden lg:block"></div>

          </div>

          {/* Navigation Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
            {!isDirectivo && (
              <Link href="/horarios" className="block">
                <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-4 sm:p-6 border-l-4 border-blue-500">
                  <div className="flex items-center">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                      <h3 className="text-base sm:text-lg font-medium text-gray-900 truncate">Gestión de Horarios</h3>
                      <p className="text-xs sm:text-sm text-gray-500 mt-1">Crear y administrar horarios múltiples</p>
                    </div>
                  </div>
                  <div className="mt-3 sm:mt-4">
                    <span className="inline-flex items-center text-xs sm:text-sm font-medium text-blue-600">
                      Acceder
                      <svg className="ml-1 w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </div>
              </Link>
            )}

            {isDirectivo && (
              <>
                {/* Tarjetas arrastrables */}
                {cardOrder.map((cardId, index) => {
                  const card = directivoCards.find(c => c.id === cardId);
                  if (!card) return null;
                  return renderCard(card, index);
                })}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
