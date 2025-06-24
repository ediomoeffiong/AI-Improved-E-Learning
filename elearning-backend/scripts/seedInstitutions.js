const mongoose = require('mongoose');
const Institution = require('../models/Institution');
require('dotenv').config();

// Nigerian Universities List (from frontend constants)
const NIGERIAN_UNIVERSITIES = [
  // A
  { value: 'abia-state-university', label: 'Abia State University (Uturu)', location: 'Uturu', state: 'Abia' },
  { value: 'abubakar-tafawa-balewa-university', label: 'Abubakar Tafawa Balewa University (Bauchi)', location: 'Bauchi', state: 'Bauchi' },
  { value: 'achievers-university', label: 'Achievers University (Owo)', location: 'Owo', state: 'Ondo' },
  { value: 'adamawa-state-university', label: 'Adamawa State University (Mubi)', location: 'Mubi', state: 'Adamawa' },
  { value: 'adekunle-ajasin-university', label: 'Adekunle Ajasin University (Akungba Akoko)', location: 'Akungba Akoko', state: 'Ondo' },
  { value: 'adeleke-university', label: 'Adeleke University (Ede)', location: 'Ede', state: 'Osun' },
  { value: 'afe-babalola-university', label: 'Afe Babalola University (Ado‑Ekiti)', location: 'Ado‑Ekiti', state: 'Ekiti' },
  { value: 'ahmadu-bello-university', label: 'Ahmadu Bello University (Zaria)', location: 'Zaria', state: 'Kaduna' },
  { value: 'ajayi-crowther-university', label: 'Ajayi Crowther University (Oyo)', location: 'Oyo', state: 'Oyo' },
  { value: 'akwa-ibom-state-university', label: 'Akwa Ibom State University (Uyo)', location: 'Uyo', state: 'Akwa Ibom' },
  { value: 'al-hikmah-university', label: 'Al‑Hikmah University (Ilorin)', location: 'Ilorin', state: 'Kwara' },
  { value: 'al-qalam-university', label: 'Al‑Qalam University (Katsina)', location: 'Katsina', state: 'Katsina' },
  { value: 'american-university-nigeria', label: 'American University of Nigeria (Yola)', location: 'Yola', state: 'Adamawa' },
  { value: 'anchor-university', label: 'Anchor University (Lagos)', location: 'Lagos', state: 'Lagos' },
  { value: 'arthur-jarvis-university', label: 'Arthur Jarvis University (Akpabuyo)', location: 'Akpabuyo', state: 'Cross River' },

  // B
  { value: 'babcock-university', label: 'Babcock University (Ilishan‑Remo)', location: 'Ilishan‑Remo', state: 'Ogun' },
  { value: 'bayero-university', label: 'Bayero University (Kano)', location: 'Kano', state: 'Kano' },
  { value: 'baze-university', label: 'Baze University (Abuja)', location: 'Abuja', state: 'FCT' },
  { value: 'bells-university', label: 'Bells University of Technology (Ota)', location: 'Ota', state: 'Ogun' },
  { value: 'benson-idahosa-university', label: 'Benson Idahosa University (Benin City)', location: 'Benin City', state: 'Edo' },
  { value: 'bingham-university', label: 'Bingham University (Karu)', location: 'Karu', state: 'Nasarawa' },
  { value: 'bowen-university', label: 'Bowen University (Iwo)', location: 'Iwo', state: 'Osun' },

  // C
  { value: 'caleb-university', label: 'Caleb University (Lagos)', location: 'Lagos', state: 'Lagos' },
  { value: 'caritas-university', label: 'Caritas University (Enugu)', location: 'Enugu', state: 'Enugu' },
  { value: 'chrisland-university', label: 'Chrisland University (Abeokuta)', location: 'Abeokuta', state: 'Ogun' },
  { value: 'christopher-university', label: 'Christopher University (Mowe)', location: 'Mowe', state: 'Ogun' },
  { value: 'covenant-university', label: 'Covenant University (Ota)', location: 'Ota', state: 'Ogun' },
  { value: 'crawford-university', label: 'Crawford University (Igbesa)', location: 'Igbesa', state: 'Ogun' },
  { value: 'cross-river-university', label: 'Cross River University of Technology (Calabar)', location: 'Calabar', state: 'Cross River' },

  // D-E
  { value: 'delta-state-university', label: 'Delta State University (Abraka)', location: 'Abraka', state: 'Delta' },
  { value: 'dominican-university', label: 'Dominican University (Ibadan)', location: 'Ibadan', state: 'Oyo' },
  { value: 'eastern-palm-university', label: 'Eastern Palm University (Ogboko)', location: 'Ogboko', state: 'Imo' },
  { value: 'ebonyi-state-university', label: 'Ebonyi State University (Abakaliki)', location: 'Abakaliki', state: 'Ebonyi' },
  { value: 'edo-university', label: 'Edo University (Iyamho)', location: 'Iyamho', state: 'Edo' },
  { value: 'ekiti-state-university', label: 'Ekiti State University (Ado‑Ekiti)', location: 'Ado‑Ekiti', state: 'Ekiti' },
  { value: 'elizade-university', label: 'Elizade University (Ilara‑Mokin)', location: 'Ilara‑Mokin', state: 'Ondo' },
  { value: 'enugu-state-university', label: 'Enugu State University of Science & Technology (Enugu)', location: 'Enugu', state: 'Enugu' },

  // F
  { value: 'federal-university-agriculture-abeokuta', label: 'Federal University of Agriculture (Abeokuta)', location: 'Abeokuta', state: 'Ogun' },
  { value: 'federal-university-agriculture-makurdi', label: 'Federal University of Agriculture (Makurdi)', location: 'Makurdi', state: 'Benue' },
  { value: 'federal-university-petroleum-resources', label: 'Federal University of Petroleum Resources (Effurun)', location: 'Effurun', state: 'Delta' },
  { value: 'federal-university-technology-akure', label: 'Federal University of Technology (Akure)', location: 'Akure', state: 'Ondo' },
  { value: 'federal-university-technology-minna', label: 'Federal University of Technology (Minna)', location: 'Minna', state: 'Niger' },
  { value: 'federal-university-technology-owerri', label: 'Federal University of Technology (Owerri)', location: 'Owerri', state: 'Imo' },
  { value: 'federal-university-birnin-kebbi', label: 'Federal University (Birnin Kebbi)', location: 'Birnin Kebbi', state: 'Kebbi' },
  { value: 'federal-university-dutse', label: 'Federal University (Dutse)', location: 'Dutse', state: 'Jigawa' },
  { value: 'federal-university-dutsin-ma', label: 'Federal University (Dutsin‑Ma)', location: 'Dutsin‑Ma', state: 'Katsina' },
  { value: 'federal-university-gashua', label: 'Federal University (Gashua)', location: 'Gashua', state: 'Yobe' },
  { value: 'federal-university-gusau', label: 'Federal University (Gusau)', location: 'Gusau', state: 'Zamfara' },
  { value: 'federal-university-kashere', label: 'Federal University (Kashere)', location: 'Kashere', state: 'Gombe' },
  { value: 'federal-university-lafia', label: 'Federal University (Lafia)', location: 'Lafia', state: 'Nasarawa' },
  { value: 'federal-university-lokoja', label: 'Federal University (Lokoja)', location: 'Lokoja', state: 'Kogi' },
  { value: 'federal-university-otuoke', label: 'Federal University (Otuoke)', location: 'Otuoke', state: 'Bayelsa' },
  { value: 'federal-university-oye-ekiti', label: 'Federal University (Oye‑Ekiti)', location: 'Oye‑Ekiti', state: 'Ekiti' },
  { value: 'federal-university-wukari', label: 'Federal University (Wukari)', location: 'Wukari', state: 'Taraba' },
  { value: 'fountain-university', label: 'Fountain University (Osogbo)', location: 'Osogbo', state: 'Osun' },

  // G-I
  { value: 'godfrey-okoye-university', label: 'Godfrey Okoye University (Ugwuomu‑Nike)', location: 'Ugwuomu‑Nike', state: 'Enugu' },
  { value: 'gombe-state-university', label: 'Gombe State University (Gombe)', location: 'Gombe', state: 'Gombe' },
  { value: 'gregory-university', label: 'Gregory University (Uturu)', location: 'Uturu', state: 'Abia' },
  { value: 'hallmark-university', label: 'Hallmark University (Ijebu‑Itele)', location: 'Ijebu‑Itele', state: 'Ogun' },
  { value: 'hezekiah-university', label: 'Hezekiah University (Umudi)', location: 'Umudi', state: 'Imo' },
  { value: 'ibrahim-badamasi-babangida-university', label: 'Ibrahim Badamasi Babangida University (Lapai)', location: 'Lapai', state: 'Niger' },
  { value: 'igbinedion-university', label: 'Igbinedion University (Okada)', location: 'Okada', state: 'Edo' },
  { value: 'imo-state-university', label: 'Imo State University (Owerri)', location: 'Owerri', state: 'Imo' },

  // J-L
  { value: 'joseph-ayo-babalola-university', label: 'Joseph Ayo Babalola University (Ikeji‑Arakeji)', location: 'Ikeji‑Arakeji', state: 'Osun' },
  { value: 'kaduna-state-university', label: 'Kaduna State University (Kaduna)', location: 'Kaduna', state: 'Kaduna' },
  { value: 'kano-university-science-technology', label: 'Kano University of Science & Technology (Wudil)', location: 'Wudil', state: 'Kano' },
  { value: 'kebbi-state-university', label: 'Kebbi State University of Science & Technology (Aliero)', location: 'Aliero', state: 'Kebbi' },
  { value: 'kogi-state-university', label: 'Kogi State University (Anyigba)', location: 'Anyigba', state: 'Kogi' },
  { value: 'kwara-state-university', label: 'Kwara State University (Malete)', location: 'Malete', state: 'Kwara' },
  { value: 'kwararafa-university', label: 'Kwararafa University (Wukari)', location: 'Wukari', state: 'Taraba' },
  { value: 'ladoke-akintola-university', label: 'Ladoke Akintola University of Technology (Ogbomoso)', location: 'Ogbomoso', state: 'Oyo' },
  { value: 'lagos-state-university', label: 'Lagos State University (Lagos)', location: 'Lagos', state: 'Lagos' },
  { value: 'landmark-university', label: 'Landmark University (Omu‑Aran)', location: 'Omu‑Aran', state: 'Kwara' },
  { value: 'lead-city-university', label: 'Lead City University (Ibadan)', location: 'Ibadan', state: 'Oyo' },

  // M-N
  { value: 'madonna-university', label: 'Madonna University (Okija)', location: 'Okija', state: 'Anambra' },
  { value: 'mcpherson-university', label: 'McPherson University (Seriki Sotayo)', location: 'Seriki Sotayo', state: 'Ogun' },
  { value: 'michael-okpara-university', label: 'Michael Okpara University of Agriculture (Umudike)', location: 'Umudike', state: 'Abia' },
  { value: 'modibbo-adama-university', label: 'Modibbo Adama University of Technology (Yola)', location: 'Yola', state: 'Adamawa' },
  { value: 'mountain-top-university', label: 'Mountain Top University (Ibafo)', location: 'Ibafo', state: 'Ogun' },
  { value: 'nasarawa-state-university', label: 'Nasarawa State University (Keffi)', location: 'Keffi', state: 'Nasarawa' },
  { value: 'niger-delta-university', label: 'Niger Delta University (Wilberforce Island)', location: 'Wilberforce Island', state: 'Bayelsa' },
  { value: 'nile-university', label: 'Nile University of Nigeria (Abuja)', location: 'Abuja', state: 'FCT' },
  { value: 'nnamdi-azikiwe-university', label: 'Nnamdi Azikiwe University (Awka)', location: 'Awka', state: 'Anambra' },
  { value: 'northwest-university', label: 'Northwest University (Kano)', location: 'Kano', state: 'Kano' },
  { value: 'novena-university', label: 'Novena University (Ogume)', location: 'Ogume', state: 'Delta' },

  // O-P
  { value: 'obafemi-awolowo-university', label: 'Obafemi Awolowo University (Ile‑Ife)', location: 'Ile‑Ife', state: 'Osun' },
  { value: 'obong-university', label: 'Obong University (Obong Ntak)', location: 'Obong Ntak', state: 'Akwa Ibom' },
  { value: 'oduduwa-university', label: 'Oduduwa University (Ipetumodu)', location: 'Ipetumodu', state: 'Osun' },
  { value: 'olabisi-onabanjo-university', label: 'Olabisi Onabanjo University (Ago‑Iwoye)', location: 'Ago‑Iwoye', state: 'Ogun' },
  { value: 'osun-state-university', label: 'Osun State University (Osogbo)', location: 'Osogbo', state: 'Osun' },
  { value: 'pan-atlantic-university', label: 'Pan‑Atlantic University (Lagos)', location: 'Lagos', state: 'Lagos' },
  { value: 'paul-university', label: 'Paul University (Awka)', location: 'Awka', state: 'Anambra' },
  { value: 'plateau-state-university', label: 'Plateau State University (Bokkos)', location: 'Bokkos', state: 'Plateau' },

  // R-S
  { value: 'redeemers-university', label: 'Redeemer\'s University (Ede)', location: 'Ede', state: 'Osun' },
  { value: 'renaissance-university', label: 'Renaissance University (Ugbawka)', location: 'Ugbawka', state: 'Enugu' },
  { value: 'rhema-university', label: 'Rhema University (Aba)', location: 'Aba', state: 'Abia' },
  { value: 'rivers-state-university', label: 'Rivers State University (Port Harcourt)', location: 'Port Harcourt', state: 'Rivers' },
  { value: 'salem-university', label: 'Salem University (Lokoja)', location: 'Lokoja', state: 'Kogi' },
  { value: 'samuel-adegboyega-university', label: 'Samuel Adegboyega University (Ogwa)', location: 'Ogwa', state: 'Edo' },
  { value: 'sokoto-state-university', label: 'Sokoto State University (Sokoto)', location: 'Sokoto', state: 'Sokoto' },
  { value: 'southwestern-university', label: 'Southwestern University (Okun Owa)', location: 'Okun Owa', state: 'Ogun' },
  { value: 'summit-university', label: 'Summit University (Offa)', location: 'Offa', state: 'Kwara' },

  // T-U
  { value: 'taraba-state-university', label: 'Taraba State University (Jalingo)', location: 'Jalingo', state: 'Taraba' },
  { value: 'tansian-university', label: 'Tansian University (Umunya)', location: 'Umunya', state: 'Anambra' },
  { value: 'university-of-abuja', label: 'University of Abuja (Abuja)', location: 'Abuja', state: 'FCT' },
  { value: 'university-of-benin', label: 'University of Benin (Benin City)', location: 'Benin City', state: 'Edo' },
  { value: 'university-of-calabar', label: 'University of Calabar (Calabar)', location: 'Calabar', state: 'Cross River' },
  { value: 'university-of-ibadan', label: 'University of Ibadan (Ibadan)', location: 'Ibadan', state: 'Oyo' },
  { value: 'university-of-ilorin', label: 'University of Ilorin (Ilorin)', location: 'Ilorin', state: 'Kwara' },
  { value: 'university-of-jos', label: 'University of Jos (Jos)', location: 'Jos', state: 'Plateau' },
  { value: 'university-of-lagos', label: 'University of Lagos (Lagos)', location: 'Lagos', state: 'Lagos' },
  { value: 'university-of-maiduguri', label: 'University of Maiduguri (Maiduguri)', location: 'Maiduguri', state: 'Borno' },
  { value: 'university-of-mkar', label: 'University of Mkar (Mkar)', location: 'Mkar', state: 'Benue' },
  { value: 'university-of-nigeria', label: 'University of Nigeria (Nsukka)', location: 'Nsukka', state: 'Enugu' },
  { value: 'university-of-port-harcourt', label: 'University of Port Harcourt (Port Harcourt)', location: 'Port Harcourt', state: 'Rivers' },
  { value: 'university-of-uyo', label: 'University of Uyo (Uyo)', location: 'Uyo', state: 'Akwa Ibom' },
  { value: 'usmanu-danfodiyo-university', label: 'Usmanu Danfodiyo University (Sokoto)', location: 'Sokoto', state: 'Sokoto' },

  // V-Z
  { value: 'veritas-university', label: 'Veritas University (Abuja)', location: 'Abuja', state: 'FCT' },
  { value: 'wellspring-university', label: 'Wellspring University (Benin City)', location: 'Benin City', state: 'Edo' },
  { value: 'wesley-university', label: 'Wesley University of Science & Technology (Ondo City)', location: 'Ondo City', state: 'Ondo' },
  { value: 'western-delta-university', label: 'Western Delta University (Oghara)', location: 'Oghara', state: 'Delta' },
  { value: 'yobe-state-university', label: 'Yobe State University (Damaturu)', location: 'Damaturu', state: 'Yobe' },
  { value: 'zamfara-state-university', label: 'Zamfara State University (Talata Mafara)', location: 'Talata Mafara', state: 'Zamfara' }
];

// Helper function to extract institution name and generate code
function parseInstitutionData(university) {
  // Extract the main name (before parentheses)
  const nameMatch = university.label.match(/^([^(]+)/);
  const name = nameMatch ? nameMatch[1].trim() : university.label;
  
  // Generate a code from the value
  const code = university.value.toUpperCase().replace(/-/g, '_');
  
  // Determine institution type
  let type = 'university';
  const lowerName = name.toLowerCase();
  if (lowerName.includes('polytechnic')) {
    type = 'polytechnic';
  } else if (lowerName.includes('college')) {
    type = 'college';
  } else if (lowerName.includes('institute')) {
    type = 'institute';
  }

  return {
    name,
    code,
    type,
    location: {
      state: university.state,
      city: university.location,
      country: 'Nigeria'
    },
    contact: {
      email: `info@${university.value.replace(/-/g, '')}.edu.ng`,
      phone: '+234-800-000-0000', // Default placeholder
      website: `https://${university.value.replace(/-/g, '')}.edu.ng`
    },
    status: 'verified', // All seeded institutions start as verified
    verifiedAt: new Date(),
    settings: {
      allowSelfRegistration: true,
      requireApproval: true,
      maxAdmins: 2,
      maxModerators: 5,
      enableCBT: false,
      enableClassroom: false
    },
    stats: {
      totalUsers: 0,
      totalStudents: 0,
      totalInstructors: 0,
      totalAdmins: 0,
      totalModerators: 0,
      activeCourses: 0,
      totalAssessments: 0
    },
    isActive: true
  };
}

async function seedInstitutions() {
  try {
    // Connect to MongoDB
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB successfully\n');

    // Check if institutions already exist
    const existingCount = await Institution.countDocuments();
    if (existingCount > 0) {
      console.log(`⚠️  Found ${existingCount} existing institutions. Skipping seeding to avoid duplicates.`);
      console.log('💡 To re-seed, please clear the institutions collection first.');
      process.exit(0);
    }

    console.log('🌱 Starting institution seeding...');

    // Transform university data to institution format
    const institutionsData = NIGERIAN_UNIVERSITIES.map(parseInstitutionData);

    console.log(`📚 Preparing to seed ${institutionsData.length} institutions...`);

    // Insert institutions in batches to avoid memory issues
    const batchSize = 50;
    let insertedCount = 0;

    for (let i = 0; i < institutionsData.length; i += batchSize) {
      const batch = institutionsData.slice(i, i + batchSize);
      try {
        const result = await Institution.insertMany(batch, { ordered: false });
        insertedCount += result.length;
        console.log(`✅ Inserted batch ${Math.floor(i/batchSize) + 1}: ${result.length} institutions`);
      } catch (error) {
        if (error.code === 11000) {
          // Handle duplicate key errors
          console.log(`⚠️  Some institutions in batch ${Math.floor(i/batchSize) + 1} already exist, skipping duplicates`);
        } else {
          throw error;
        }
      }
    }

    console.log(`\n🎉 Institution seeding completed successfully!`);
    console.log(`📊 Total institutions inserted: ${insertedCount}`);
    console.log(`🏛️  All Nigerian universities are now available in the system`);

    // Display some statistics
    const stats = await Institution.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      }
    ]);

    console.log('\n📈 Institution breakdown by type:');
    stats.forEach(stat => {
      console.log(`   ${stat._id}: ${stat.count}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding institutions:', error);
    process.exit(1);
  }
}

// Run the seeding function
if (require.main === module) {
  seedInstitutions();
}

// Function that works with existing database connection (for deployment script)
async function seedInstitutionsWithConnection() {
  try {
    // Check if institutions already exist
    const existingCount = await Institution.countDocuments();
    if (existingCount > 0) {
      console.log(`⚠️  Found ${existingCount} existing institutions. Skipping seeding to avoid duplicates.`);
      return;
    }

    console.log('🌱 Starting institution seeding...');

    // Transform university data to institution format
    const institutionsData = NIGERIAN_UNIVERSITIES.map(parseInstitutionData);

    console.log(`📚 Preparing to seed ${institutionsData.length} institutions...`);

    // Insert institutions in batches to avoid memory issues
    const batchSize = 50;
    let insertedCount = 0;

    for (let i = 0; i < institutionsData.length; i += batchSize) {
      const batch = institutionsData.slice(i, i + batchSize);
      try {
        const result = await Institution.insertMany(batch, { ordered: false });
        insertedCount += result.length;
        console.log(`✅ Inserted batch ${Math.floor(i/batchSize) + 1}: ${result.length} institutions`);
      } catch (error) {
        if (error.code === 11000) {
          // Handle duplicate key errors
          console.log(`⚠️  Some institutions in batch ${Math.floor(i/batchSize) + 1} already exist, skipping duplicates`);
        } else {
          throw error;
        }
      }
    }

    console.log(`\n🎉 Institution seeding completed successfully!`);
    console.log(`📊 Total institutions inserted: ${insertedCount}`);
    console.log(`🏛️  All Nigerian universities are now available in the system`);

    // Display some statistics
    const stats = await Institution.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      }
    ]);

    console.log('\n📈 Institution breakdown by type:');
    stats.forEach(stat => {
      console.log(`   ${stat._id}: ${stat.count}`);
    });

  } catch (error) {
    console.error('❌ Error seeding institutions:', error);
    throw error;
  }
}

module.exports = {
  seedInstitutions,
  seedInstitutionsWithConnection,
  NIGERIAN_UNIVERSITIES,
  parseInstitutionData
};
