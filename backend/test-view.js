const supabase = require('./src/config/supabase');
async function test() {
    const { data, error } = await supabase.from('recently_viewed').select('*').limit(1);
    console.log("Error:", error);
    console.log("Data:", data);
}
test();
