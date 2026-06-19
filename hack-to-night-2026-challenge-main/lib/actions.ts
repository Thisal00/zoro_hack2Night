'use server'

import { runStatement } from '@/lib/platform-db'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'

export async function loginUser(formData: FormData) {
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;

  try {
    // Check if user exists in the main database
    const sql = `SELECT * FROM users WHERE username = '${username}'`;
    const result = await runStatement(sql);

    if (result.rows.length === 0) {
      return { error: "❌ User does not exist. Please check your username." };
    } else {
      const user = result.rows[0];
      if (user.password !== password) {
        return { error: "❌ Password eka waradiy!" };
      }
      console.log(`✅ ${username} login wuna!`);
      
      // Set secure HTTP-only cookie
      const cookieStore = await cookies();
      cookieStore.set('auth-session', String(user.id), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/'
      });
    }

  } catch (error) {
    console.error("Database Error:", error);
    return { error: "❌ Database ekata connect wenna bari wuna." };
  }

  // Okkoma hari nam Dashboard ekata redirect karanawa
  redirect('/dashboard');
}