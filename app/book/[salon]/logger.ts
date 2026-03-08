import fs from 'fs';
import path from 'path';

export async function logToTmp(msg) {
    try {
        const logPath = path.join(process.cwd(), 'time-engine.log');
        fs.appendFileSync(logPath, new Date().toISOString() + " - " + msg + "\n");
    } catch (e) { }
}
