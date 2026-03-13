const { getRecentlyViewed } = require('./src/controllers/pyqController');
async function run() {
    const req = { params: { userId: '00000000-0000-0000-0000-000000000000' } };
    const res = {
        status: (code) => {
            console.log('Status:', code);
            return { json: (obj) => console.log('JSON:', JSON.stringify(obj, null, 2)) }
        }
    };
    await getRecentlyViewed(req, res);
}
run();
