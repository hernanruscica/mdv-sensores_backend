import  CronService from '../services/CronService.js';



export default function startCronJobs() {
  CronService.startJobs();
}
