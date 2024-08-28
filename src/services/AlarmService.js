import AlarmModel from '../models/alarmModel.js';
import DataModel from '../models/dataModel.js';
import AlarmUserModel from '../models/alarmUserModel.js';
import AlarmLogModel from '../models/alarmLogModel.js';
import { evaluate, number } from 'mathjs';

class AlarmService {
  async checkAlarms() {
    const dataFromDB = {};
    const alarms = await AlarmModel.findAll();

    if (alarms?.length == 0){
        console.log('There isnt any alarm');
        return;
    }
    const tablesUnique = new Set(alarms.map(alarm => alarm.tabla));
    const arrayTablesUnique = Array.from(tablesUnique);
    for (let table of arrayTablesUnique){
        const data = await DataModel.findAllByTimePeriod(table, '5 Minute');
        dataFromDB[table] = data;
    }
    //console.log(dataFromDB[arrayTablesUnique[0]])
    console.clear();

    for (let alarm of alarms) {
        if (alarm.nombre_variables !== "null"){
            const currentVariablesArray = alarm.nombre_variables.split(",");
            let variables = {};            
            
            for (let variable of currentVariablesArray){
                variables[variable] = number(dataFromDB[alarm.tabla][0][variable]);
            } 
            try {                
                const isTriggered = evaluate(alarm.condicion, variables);
                //  console.log(alarm.condicion, variables);
                //  console.log('Resultado de la evaluación:', isTriggered);                
                if (isTriggered) {
                    this.triggerAlarm(alarm,variables);
                }
            } catch (error) {
                console.error('Error al evaluar la condición:', error);
                console.error('Condición:', alarm.condicion);
                console.error('Variables:', variables);
            }
        }
    }
  }

  async triggerAlarm(alarm, variables) {
    const usersAffected = await AlarmUserModel.findUsersByAlarmId(alarm.id);    
    if (usersAffected.length > 0){
        for (let user of usersAffected){
            console.log(`Alarma ${alarm.nombre} disparada con ${JSON.stringify(variables)} para el  usuario con correo: ${user.email} con id: ${user.id}`);
            //alarma_id, usuario_id, canal_id, variables
            const alarmLog = {
                alarma_id: alarm.id,
                usuario_id: user.id,
                canal_id: alarm.canal_id,
                variables: JSON.stringify(variables)
            }
            const results = await AlarmLogModel.create(alarmLog)
            console.log(results>0 ? `Log inserted Ok with id: ${results}`: 'Error inserting log');
            //next task: - Make the mail notification for the users...
        }
    }
  }
}

export default new AlarmService();