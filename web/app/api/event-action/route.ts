import { createClient } from '@/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  return NextResponse.json({ success: true });
}