const bcrypt = require('bcryptjs');

// Cambia esta contraseña por la que quieras usar
const password = 'AdministracionImprenta2025';

// Generar hash con 12 salt rounds (igual que el backend)
bcrypt.hash(password, 12)
  .then(hash => {
    console.log('\n✅ Hash generado exitosamente:\n');
    console.log('Contraseña:', password);
    console.log('Hash:', hash);
    console.log('\n📋 Copia el hash y úsalo en el INSERT SQL de Supabase\n');
  })
  .catch(err => {
    console.error('Error generando hash:', err);
  });


