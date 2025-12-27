import { createClient } from '@supabase/supabase-js';

// Función para obtener las variables de entorno
const getSupabaseConfig = () => {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseServiceKey || !supabaseAnonKey) {
    throw new Error('Faltan variables de entorno de Supabase');
  }

  // Validar formato de URL
  try {
    const url = new URL(supabaseUrl);
    if (!url.protocol.startsWith('https')) {
      console.warn('⚠️ SUPABASE_URL no usa HTTPS, esto puede causar problemas');
    }
  } catch (urlError) {
    throw new Error(`SUPABASE_URL tiene un formato inválido: ${supabaseUrl}`);
  }

  return { supabaseUrl, supabaseServiceKey, supabaseAnonKey };
};

// Lazy initialization - solo se ejecuta cuando se llama
const getSupabaseClients = () => {
  const { supabaseUrl, supabaseServiceKey, supabaseAnonKey } = getSupabaseConfig();
  
  console.log('🔌 Inicializando cliente Supabase:', {
    url: supabaseUrl,
    hasServiceKey: !!supabaseServiceKey,
    hasAnonKey: !!supabaseAnonKey
  });
  
  // Usar configuración estándar de Supabase sin fetch personalizado
  // para evitar problemas con headers de autenticación
  return {
    supabaseAdmin: createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      },
      global: {
        headers: {
          'x-client-info': 'libreria-backend'
        }
      }
    }),
    supabaseClient: createClient(supabaseUrl, supabaseAnonKey)
  };
};

// Exportar las funciones en lugar de los clientes directamente
export const getSupabaseAdmin = () => getSupabaseClients().supabaseAdmin;
export const getSupabaseClient = () => getSupabaseClients().supabaseClient;

// Función para verificar conexión
export const testConnection = async () => {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Error conectando a Supabase:', error.message);
      return false;
    }
    
    console.log('✅ Conexión a Supabase establecida correctamente');
    return true;
  } catch (error) {
    console.error('❌ Error de conexión:', error);
    return false;
  }
};