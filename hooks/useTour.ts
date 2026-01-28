'use client';

import { useState, useEffect } from 'react';

const TOUR_STORAGE_KEY = 'apimentadas_tour_completed';

export function useTour() {
  const [isTourActive, setIsTourActive] = useState(false);
  const [hasCompletedTour, setHasCompletedTour] = useState(false);

  // Verificar se o tour já foi completado ao montar
  useEffect(() => {
    const completed = localStorage.getItem(TOUR_STORAGE_KEY);
    setHasCompletedTour(completed === 'true');
  }, []);

  const startTour = () => {
    setIsTourActive(true);
  };

  const completeTour = () => {
    setIsTourActive(false);
    setHasCompletedTour(true);
    localStorage.setItem(TOUR_STORAGE_KEY, 'true');
  };

  const skipTour = () => {
    setIsTourActive(false);
    setHasCompletedTour(true);
    localStorage.setItem(TOUR_STORAGE_KEY, 'true');
  };

  const resetTour = () => {
    setHasCompletedTour(false);
    localStorage.removeItem(TOUR_STORAGE_KEY);
    setIsTourActive(true);
  };

  return {
    isTourActive,
    hasCompletedTour,
    startTour,
    completeTour,
    skipTour,
    resetTour,
  };
}
