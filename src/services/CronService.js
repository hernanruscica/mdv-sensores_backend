import cron from 'node-cron';
import AlarmService  from '../services/AlarmService.js';

class CronService {
  startJobs() {
    cron.schedule('*/15 * * * * *', async () => { // Cada 30 segundos
      console.log('Verificando alarmas...');
      await AlarmService.checkAlarms();
    });
  }
}

export default  new CronService();
