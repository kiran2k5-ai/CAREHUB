// Script to add more doctors to the database
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
  'https://wbggppzxilmmsrgjdhrd.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndiZ2dwcHp4aWxtbXNyZ2pkaHJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwMzUyMjcsImV4cCI6MjA3NTYxMTIyN30.8tyiP8L97KvMDZHMOsDsUzxaZyQ-i53Eb2RARkdjOMw'
);

async function addDoctors() {
  console.log('🏥 Adding more doctors to the database...');

  const newDoctors = [
    {
      id: 'b8f7c123-9d45-4e67-8f91-234567890abc',
      name: 'Dr. Sarah Johnson',
      specialization: 'Cardiologist',
      experience: '12 years',
      consultation_fee: 800,
      rating: 4.9,
      phone: '9123456789',
      image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face'
    },
    {
      id: 'c9e8d234-ae56-4f78-9g02-345678901bcd',
      name: 'Dr. Michael Chen',
      specialization: 'Dermatologist',
      experience: '10 years',
      consultation_fee: 600,
      rating: 4.7,
      phone: '9234567890',
      image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop&crop=face'
    },
    {
      id: 'd1f9e345-bf67-4g89-ah13-456789012cde',
      name: 'Dr. Emily Rodriguez',
      specialization: 'Pediatrician',
      experience: '15 years',
      consultation_fee: 700,
      rating: 4.8,
      phone: '9345678901',
      image: 'https://images.unsplash.com/photo-1594824804732-ca8db0c3db66?w=150&h=150&fit=crop&crop=face'
    },
    {
      id: 'e2g0f456-cg78-5h90-bi24-567890123def',
      name: 'Dr. David Wilson',
      specialization: 'Orthopedic Surgeon',
      experience: '18 years',
      consultation_fee: 1000,
      rating: 4.9,
      phone: '9456789012',
      image: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=150&h=150&fit=crop&crop=face'
    }
  ];

  for (const doctor of newDoctors) {
    try {
      console.log(`➕ Adding ${doctor.name}...`);
      
      const { data, error } = await supabase
        .from('doctors')
        .insert([doctor])
        .select();

      if (error) {
        console.error(`❌ Failed to add ${doctor.name}:`, error.message);
      } else {
        console.log(`✅ Successfully added ${doctor.name} with ID: ${data[0].id}`);
      }
    } catch (err) {
      console.error(`❌ Error adding ${doctor.name}:`, err.message);
    }
  }

  console.log('🎉 Finished adding doctors!');
}

addDoctors().catch(console.error);