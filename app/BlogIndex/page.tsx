'use client';

import { useSearchParams } from 'next/navigation';
import React from 'react';

const schedule: React.FC = () => {
  const searchParams = useSearchParams();
  const userName = searchParams.get('name') || 'ユーザー';

  return (
    <main>
      <h1>{userName}さんこんにちは</h1>
    </main>
  );
};

export default schedule;