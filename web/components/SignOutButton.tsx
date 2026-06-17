'use client';

import { createClient } from '@/supabase/client';

export default function SignOutButton() {
  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.reload();
  };

  return (
    <button 
      onClick={handleSignOut}
      style={{
        padding: '8px 16px',
        borderRadius: 14,
        background: '#ef4444',
        color: 'white',
        border: 'none',
        cursor: 'pointer',
        fontWeight: 800,
      }}
    >
      Sign Out
    </button>
  );
}