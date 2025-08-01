import cron from 'node-cron';
import AlarmService  from '../services/AlarmService.js';

class CronService {
  startJobs() {
    cron.schedule('*/5 * * * * ', async () => { // Cada ... */1 * * * * = 1 minuto / */30 * * * * * = 30 segundos
      //console.clear();
      //console.log('Verificando alarmas...s');
      await AlarmService.checkAlarms();
    });
  }
}

export default  new CronService();
