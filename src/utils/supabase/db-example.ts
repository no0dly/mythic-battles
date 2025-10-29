// Examples of working with Supabase Database

import { createClient } from '@/lib/supabase/server'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'

// Example: getting data from a table
export const fetchData = async () => {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('users')
    .select('*')
  
  if (error) {
    console.error('Error fetching data:', error)
    return null
  }
  
  return data
}


// Example: subscribing to changes (for Client Components)
export const subscribeToChanges = (supabase: SupabaseClient<Database>, callback: (payload: unknown) => void) => {
  return supabase
    .channel('users_changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'users',
      },
      callback
    )
    .subscribe()
}

