'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/supabase/client';

export default function UserDisplay() {
  const [email, setEmail] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setEmail(data.user.email ?? null);
    });
  }, []);

  return <p style={subhead}>{email ? `Logged in as: ${email}` : 'Not logged in'}</p>;
}

const subhead: React.CSSProperties = {
  margin: "14px 0 0",
  color: "#4F4F63",
  fontSize: 16,
  lineHeight: 1.6,
  maxWidth: 520,
};