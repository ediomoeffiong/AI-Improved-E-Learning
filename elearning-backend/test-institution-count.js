const mongoose = require('mongoose');
const Institution = require('./models/Institution');
require('dotenv').config();

async function testInstitutionCount() {
  try {
    console.log('🔍 Testing Institution Count...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Test different counting methods
    console.log('\n📊 Testing different counting methods:');
    
    // Method 1: countDocuments()
    const count1 = await Institution.countDocuments();
    console.log(`1. Institution.countDocuments(): ${count1}`);
    
    // Method 2: estimatedDocumentCount()
    const count2 = await Institution.estimatedDocumentCount();
    console.log(`2. Institution.estimatedDocumentCount(): ${count2}`);
    
    // Method 3: find().length
    const institutions = await Institution.find();
    console.log(`3. Institution.find().length: ${institutions.length}`);
    
    // Method 4: aggregate count
    const aggregateResult = await Institution.aggregate([
      { $count: "total" }
    ]);
    const count4 = aggregateResult.length > 0 ? aggregateResult[0].total : 0;
    console.log(`4. Aggregate count: ${count4}`);
    
    // Show some sample institutions
    console.log('\n🏛️ Sample institutions:');
    const sampleInstitutions = await Institution.find().limit(5).select('name code type status');
    sampleInstitutions.forEach((inst, index) => {
      console.log(`   ${index + 1}. ${inst.name} (${inst.code}) - ${inst.type} - ${inst.status}`);
    });
    
    // Check collection stats
    console.log('\n📈 Collection statistics:');
    const stats = await mongoose.connection.db.collection('institutions').stats();
    console.log(`   Documents: ${stats.count}`);
    console.log(`   Size: ${stats.size} bytes`);
    console.log(`   Average document size: ${stats.avgObjSize} bytes`);
    
    // Test the exact same query used in the API
    console.log('\n🔬 Testing exact API query:');
    const apiCount = await Institution.countDocuments();
    console.log(`   API query result: ${apiCount}`);
    
    await mongoose.disconnect();
    console.log('\n✅ Test completed');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testInstitutionCount();
