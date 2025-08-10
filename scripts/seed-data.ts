import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../src/types/database.types';

// Cargar variables de entorno desde .env.local
config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Faltan variables de entorno necesarias');
  process.exit(1);
}

const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const premiosIniciales = [
  {
    name: 'TV 50" 4K',
    description: 'Televisor Smart TV 4K de 50 pulgadas',
    probability: 5.00,
    stock: 1,
    image_url: '/assets/prizes/tv.png',
    is_active: true
  },
  {
    name: 'Smartphone',
    description: 'Último modelo de smartphone',
    probability: 10.00,
    stock: 2,
    image_url: '/assets/prizes/phone.png',
    is_active: true
  },
  {
    name: 'Auriculares Bluetooth',
    description: 'Auriculares inalámbricos de alta calidad',
    probability: 15.00,
    stock: 5,
    image_url: '/assets/prizes/headphones.png',
    is_active: true
  },
  {
    name: 'Vale de Descuento',
    description: '50% de descuento en tu próxima compra',
    probability: 30.00,
    stock: 20,
    image_url: '/assets/prizes/discount.png',
    is_active: true
  },
  {
    name: 'Puntos Extra',
    description: '1000 puntos para tu cuenta',
    probability: 40.00,
    stock: 50,
    image_url: '/assets/prizes/points.png',
    is_active: true
  }
];

async function seedData() {
  try {
    console.log('🌱 Iniciando inserción de datos de prueba...');

    // Insertar premios
    const { data: prizes, error: prizesError } = await supabaseAdmin
      .from('prizes')
      .insert(premiosIniciales)
      .select();

    if (prizesError) {
      throw prizesError;
    }

    console.log(`✅ ${prizes.length} premios insertados correctamente`);

    // Crear usuario administrador de prueba
    const { data: adminUser, error: adminError } = await supabaseAdmin.auth.admin.createUser({
      email: 'admin@example.com',
      password: 'admin123456',
      email_confirm: true,
      user_metadata: {
        role: 'admin'
      }
    });

    if (adminError) {
      throw adminError;
    }

    // Actualizar rol en la tabla users
    if (adminUser.user) {
      const { error: userError } = await supabaseAdmin
        .from('users')
        .update({ role: 'admin' })
        .eq('id', adminUser.user.id);

      if (userError) {
        throw userError;
      }
    }

    console.log('✅ Usuario administrador creado correctamente');
    console.log('🎉 Datos de prueba insertados con éxito');

  } catch (error) {
    console.error('❌ Error al insertar datos de prueba:', error);
    process.exit(1);
  }
}

seedData(); 