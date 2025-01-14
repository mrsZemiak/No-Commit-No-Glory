import app from './app';
import cron from 'node-cron';
import { updateConferenceStatus } from './middleware/updateConferenceStatus'
import { updatePaperStatus } from './middleware/updatePaperStatus'

app.listen(5000, () => {
    console.log(`Backend is running on http://localhost:5000`);
});

// Schedule the cron job
cron.schedule('0 0 * * *', async () => {
    console.log('Running daily job to update statuses');
    try {
        await updateConferenceStatus();
        await updatePaperStatus();
        console.log('All statuses updated successfully');
    } catch (error) {
        console.error('Error running daily job to update statuses:', error);
    }
});

