import app from './app';
import cron from 'node-cron';
import { updateConferenceStatus } from './middleware/updateStatus'

app.listen(5000, () => {
    console.log(`Backend is running on http://localhost:5000`);
});

// Schedule the cron job
cron.schedule('0 0 * * *', async () => {
    console.log('Running scheduled conference status update');
    try {
        await updateConferenceStatus();
        console.log('Conference statuses updated successfully');
    } catch (error) {
        console.error('Error updating conference statuses:', error);
    }
});
