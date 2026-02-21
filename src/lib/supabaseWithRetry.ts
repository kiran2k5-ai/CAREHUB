import { supabaseAdmin } from './supabase';

export interface RetryOptions {
  maxRetries?: number;
  delayMs?: number;
  backoffMultiplier?: number;
}

export async function supabaseWithRetry<T>(
  operation: () => Promise<{ data: T | null; error: any }>,
  options: RetryOptions = {}
): Promise<{ data: T | null; error: any }> {
  const { maxRetries = 3, delayMs = 1000, backoffMultiplier = 2 } = options;
  
  let lastError: any;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 Attempt ${attempt}/${maxRetries} for Supabase operation`);
      
      const result = await operation();
      
      if (!result.error) {
        console.log(`✅ Supabase operation succeeded on attempt ${attempt}`);
        return result;
      }
      
      lastError = result.error;
      console.log(`⚠️ Attempt ${attempt} failed:`, result.error.message);
      
      // Don't retry on certain errors (like "not found")
      if (result.error.code === 'PGRST116' || result.error.message?.includes('not found')) {
        console.log('❌ Non-retryable error, stopping retries');
        return result;
      }
      
    } catch (error) {
      lastError = error;
      console.log(`❌ Attempt ${attempt} threw error:`, error);
    }
    
    // Wait before next attempt (with exponential backoff)
    if (attempt < maxRetries) {
      const delay = delayMs * Math.pow(backoffMultiplier, attempt - 1);
      console.log(`⏳ Waiting ${delay}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  console.log(`❌ All ${maxRetries} attempts failed`);
  return { data: null, error: lastError };
}

// Specific helper for doctor queries
export async function getDoctorWithRetry(doctorId: string) {
  return supabaseWithRetry(
    async () => {
      const result = await supabaseAdmin
        .from('doctors')
        .select('*')
        .eq('id', doctorId)
        .single();
      return result;
    },
    { maxRetries: 3, delayMs: 500 }
  );
}

// Helper for getting all doctors
export async function getAllDoctorsWithRetry() {
  return supabaseWithRetry(
    async () => {
      try {
        const result = await supabaseAdmin
          .from('doctors')
          .select(`
            *
          `);
        return result;
      } catch (error) {
        console.log('🔄 Connection failed, will use fallback data');
        // Return a specific error that indicates we should use fallback
        return { data: null, error: { message: 'CONNECTION_FAILED', code: 'FALLBACK_REQUIRED' } };
      }
    },
    { maxRetries: 2, delayMs: 300 } // Reduce retries to fail faster and use fallback
  );
}

// Specific helper for appointments queries
export async function getAppointmentsWithRetry(patientId: string) {
  return supabaseWithRetry(
    async () => {
      try {
        const result = await supabaseAdmin
          .from('appointments')
          .select('*')
          .eq('patient_id', patientId)
          .order('date', { ascending: false });
        return result;
      } catch (error) {
        console.log('🔄 Appointments connection failed, will use fallback data');
        // Return a specific error that indicates we should use fallback
        return { data: null, error: { message: 'CONNECTION_FAILED', code: 'FALLBACK_REQUIRED' } };
      }
    },
    { maxRetries: 2, delayMs: 300 } // Reduce retries to fail faster and use fallback
  );
}

// Helper to test connection
export async function testSupabaseConnection() {
  try {
    // Test with a simple query that should work regardless of schema
    const { data, error } = await supabaseAdmin
      .from('users') // Use users table instead of doctors since it's more likely to exist
      .select('id')
      .limit(1);
    
    return { connected: !error, error };
  } catch (error) {
    console.log('🔄 Connection test failed, will use fallback data');
    return { connected: false, error };
  }
}