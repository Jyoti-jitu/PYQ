const { logView } = require('./src/controllers/pyqController');
async function run() {
    const req = { body: { userId: '11111111-1111-1111-1111-111111111111', pyqId: '11111111-1111-1111-1111-111111111111' } };
    const res = {
        status: (code) => {
            console.log('Status:', code);
            return { json: (obj) => console.log('JSON:', JSON.stringify(obj, null, 2)) }
        }
    };
    await logView(req, res);
}
run();
