import AlarmModel from '../models/alarmModel.js';
import DataModel from '../models/dataModel.js';
import { evaluate } from 'mathjs';

class AlarmService {
  async checkAlarms() {
    const dataFromDB = {};
    const alarms = await AlarmModel.findAll();

    const tablesUnique = new Set(alarms.map(alarm => alarm.tabla));
    const arrayTablesUnique = Array.from(tablesUnique);
    
    for (let table of arrayTablesUnique){
        const data = await DataModel.findAllByTimePeriod(table, '5 Minute');
        dataFromDB[table] = data;
    }
    console.clear();

    for (let alarm of alarms) {
        if (alarm.nombre_variables !== "null"){
            const currentVariablesArray = alarm.nombre_variables.split(",");
            let variables = {};            
            
            for (let variable of currentVariablesArray){
                variables[variable] = parseFloat(dataFromDB[alarm.tabla][0][variable]);
            } 
                         
            console.log(alarm.condicion, variables);
            
            try {                
                const isTriggered = evaluate(alarm.condicion, variables);
                console.log('Resultado de la evaluación:', isTriggered);
                
                if (isTriggered) {
                    this.triggerAlarm(alarm);
                }
            } catch (error) {
                console.error('Error al evaluar la condición:', error);
                console.error('Condición:', alarm.condicion);
                console.error('Variables:', variables);
            }
        }
    }
  }

  triggerAlarm(alarm) {
    console.log(`Alarma ${alarm.nombre} disparada`);
  }
}

export default new AlarmService();