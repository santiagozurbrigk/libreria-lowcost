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

// Fetch personalizado con timeout y mejor manejo de errores
const customFetch: typeof fetch = async (input: string | URL | Request, init?: RequestInit) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 segundos timeout

  try {
    // Convertir input a string para logging
    const urlString = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
    const urlObj = new URL(urlString);
    
    // Log de la URL que se está intentando conectar (sin exponer credenciales)
    console.log('🌐 Intentando conectar a Supabase:', {
      host: urlObj.host,
      pathname: urlObj.pathname,
      method: init?.method || 'GET'
    });

    const response = await fetch(input, {
      ...init,
      signal: controller.signal,
      headers: {
        ...init?.headers,
        'Connection': 'keep-alive',
      }
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error: any) {
    clearTimeout(timeoutId);
    const urlString = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
    
    if (error.name === 'AbortError') {
      const errorMsg = `Timeout al conectar con Supabase después de 30 segundos`;
      console.error('⏱️', errorMsg, { url: new URL(urlString).host });
      throw new Error(errorMsg);
    }
    // Log detallado del error
    const urlObj = new URL(urlString);
    console.error('❌ Error en fetch a Supabase:', {
      host: urlObj.host,
      pathname: urlObj.pathname,
      message: error.message,
      cause: error.cause?.message || error.cause,
      code: error.code,
      errno: error.errno,
      syscall: error.syscall
    });
    throw error;
  }
};

// Lazy initialization - solo se ejecuta cuando se llama
const getSupabaseClients = () => {
  const { supabaseUrl, supabaseServiceKey, supabaseAnonKey } = getSupabaseConfig();
  
  console.log('🔌 Inicializando cliente Supabase:', {
    url: supabaseUrl,
    hasServiceKey: !!supabaseServiceKey,
    hasAnonKey: !!supabaseAnonKey
  });
  
  return {
    supabaseAdmin: createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      },
      global: {
        fetch: customFetch,
        headers: {
          'x-client-info': 'libreria-backend'
        }
      }
    }),
    supabaseClient: createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        fetch: customFetch
      }
    })
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