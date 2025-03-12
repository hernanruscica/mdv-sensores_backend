import AlarmModel from '../models/alarmModel.js';
import DataModel from '../models/dataModel.js';
import AlarmUserModel from '../models/alarmUserModel.js';
import AlarmLogModel from '../models/alarmLogModel.js';
import { evaluate } from 'mathjs';
import { calculatePorcentageOn } from '../utils/MathUtils.js';
import { sendMessage, testMessage } from '../utils/mail.js';
import generateTokenAlarmLog from '../utils/generateTokenAlarmLog.js';

class AlarmService {
  async checkAlarms() {
    
    const alarms = await AlarmModel.findAll();    
    //if there is any alarm, do nothing
    if (alarms?.length == 0){
        console.log('No alarms');
        return;
    }         
    //console.log(alarms);

    //await testMessage('Hi, Im testing...', 'cesarhernanruscica@gmail.com');
    
    
    for (let alarm of alarms){                  
        //console.log(alarm.nombre, alarm.tabla, alarm.columna, alarm.periodo_tiempo, alarm.nombre_variables, alarm.condicion);
        
        
        switch (alarm.tipo_alarma) {
            case "PORCENTAJE_ENCENDIDO":
                //console.log("getporcentageson and evaluates the condition");
                const tableName = alarm.tabla;
                const columnPrefix = alarm.columna;
                const timePeriod = alarm.periodo_tiempo;
                const currentData = await DataModel.findDataFromDigitalChannel(tableName, columnPrefix, timePeriod );
                const rangePorcentageSecs = timePeriod * 60;
                const dataPorcentagesOn = calculatePorcentageOn(currentData, rangePorcentageSecs);
                if (dataPorcentagesOn?.length > 0){
                    //the last data
                    const currentPorcentage = dataPorcentagesOn[dataPorcentagesOn.length - 1].porcentaje_encendido;
                    let variables = {};
                    variables['porcentaje_encendido'] = currentPorcentage;
                    try {
                        const isTriggered = evaluate(alarm.condicion, variables);
                        //console.log(alarm.nombre, alarm.condicion, variables, isTriggered);   
                        if (isTriggered) {
                            this.triggerAlarm(alarm, variables);
                        }else{
                            this.resetAlarm(alarm, variables);
                        }                   
                    } catch (error) {
                        console.error('Error al evaluar la condición:', error);
                        console.error('Condición:', alarm.condicion);
                        console.error('Variables:', variables);                        
                    }
                }
                break;
            case "FALLO_COMUNICACION":
                //console.log("controlando alarma de fallo de comunicacion...");
                const tableNameFail = alarm.tabla;
                const currentDataFail = await DataModel.findLastDataFromTable(tableNameFail);
                //
                const now = Date.now() - 3 * 60 * 60 * 1000;
                const lastDate = new Date(currentDataFail[0].fecha).getTime();                 
                const variablesNamesFail = alarm.nombre_variables.split(',');     
                const variablesFails = {};
                /*
                console.log(`ultimo dato en timestamp: ${lastDate}\n
                             Ahora: ${now}\n
                             Diferencia: ${now - lastDate} en minutos: ${(now - lastDate) / 1000 / 60}\n
                             Tolerancia: `, alarm, variablesNamesFail);  
                             */
                for (let index in variablesNamesFail){
                    //console.log(variablesNamesFail[index]);
                    const currentName = variablesNamesFail[index];
                    if (index == 0){
                        //fecha
                        variablesFails[currentName] = parseInt(lastDate) /60 /1000 ;
                    }
                    if (index == 1){
                        //fecha actual
                        variablesFails[currentName] = parseInt(now) /60 /1000 ;
                    }
                }
                //console.log(variablesFails.fecha_actual - variablesFails.fecha);
                variablesFails['minutos_sin_conexion'] = variablesFails.fecha_actual - variablesFails.fecha;

                try {
                     
                    const isTriggered = evaluate(alarm.condicion, variablesFails);
                   
                    const timeWithoutComunication = variablesFails.minutos_sin_conexion.toFixed(1);
                    if (isTriggered) {
                        console.log('***********************\nSe disparo la alarma de fallo de conexion', timeWithoutComunication);
                        this.triggerAlarm(alarm, {minutos_sin_conexion: timeWithoutComunication});
                    }else{
                        console.log('***********************\nNo se disparo la alarma de fallo de conexion', timeWithoutComunication)
                        this.resetAlarm(alarm, {minutos_sin_conexion: timeWithoutComunication});
                    }                   
                } catch (error) {
                    console.error('Error al evaluar la condición:', error);
                    console.error('Condición:', alarm.condicion);
                    console.error('Variables:', variablesFails);                        
                } 
                /**/               
                
                break;

            default:
                console.log(`Unhandled nombre_variables: ${alarm.nombre_variables}`);
                break;
            }   
    }   
  }

  async triggerAlarm(alarm, variables) {
    console.log(`Alarm evaluation positive: ${alarm.nombre}`);
    if (alarm.disparada == 0){        
        //Tengo que actualizar disparada en alarma BD
        
        alarm.disparada = 1;
        const affectedRows = await AlarmModel.updateTrigger(alarm.id, alarm.disparada);
        console.log((affectedRows == 1) ? 'Alarm trigger updated OK: DISPARADA' : 'Error updating alarm trigger');    


        const usersAffected = await AlarmUserModel.findUsersByAlarmId(alarm.id);    
        //console.log(usersAffected);        

        if (usersAffected.length > 0){
            let insertedId=null;
            for (let user of usersAffected){
                console.log(`Alarma ${alarm.nombre} DISPARADA con ${JSON.stringify(variables)} para el  usuario con correo: ${user.email} con id: ${user.id}`);
                //alarma_id, usuario_id, canal_id, variables
                const alarmLog = {
                    alarma_id: alarm.id,
                    usuario_id: user.id,
                    canal_id: alarm.canal_id,
                    variables: JSON.stringify(variables),
                    disparada: 1
                }
                insertedId = await AlarmLogModel.create(alarmLog) //insertedId
                console.log(insertedId > 0 ? `Alarm Log inserted Ok with id: ${insertedId}`: 'Error inserting log');                
                
                try {         
                    if (insertedId <= 0){
                        throw new Error("Error inserting Alarm Log");                        
                    }                    
                    console.log('genero el token con estos datos: ',insertedId, user.id, alarm.id, alarm.canal_id);
                    const token = generateTokenAlarmLog(insertedId, user.id, alarm.id, alarm.canal_id, alarm.datalogger_id);
                    console.log('token: ', token);
                    const emailToSend = user.email;
                    const results =  await sendMessage(alarm, variables, emailToSend, token);
                    if (results == true){
                        console.log('Email alarm sended OK !');                        
                    }else{
                        console.log('Error sending alarm email');
                    }        
                } catch (error) {
                    console.error('Alarm triggered, but error: ', error);
                }                
            }
        }
    }else{
        console.log(`la alarma ${alarm.nombre} sigue disparada...\n`);
    }
  }
  async resetAlarm(alarm, variables) {
    console.log(`Alarm evaluation negative ${alarm.nombre}`);
    if (alarm.disparada == 1){

        alarm.disparada = 0;
        const affectedRows = await AlarmModel.updateTrigger(alarm.id, alarm.disparada);
        console.log(affectedRows == 1 ? 'Alarm trigger updated OK: NO DISPARADA' : 'Error updating alarm trigger');         


        const usersAffected = await AlarmUserModel.findUsersByAlarmId(alarm.id);  
        //console.log(usersAffected);  
        if (usersAffected.length > 0){
            for (let user of usersAffected){
                console.log(`Alarma ${alarm.nombre} RESETEADA con ${JSON.stringify(variables)} para el  usuario con correo: ${user.email} con id: ${user.id}`);
                const alarmLog = {
                    alarma_id: alarm.id,
                    usuario_id: user.id,
                    canal_id: alarm.canal_id,
                    variables: JSON.stringify(variables),
                    disparada: 0
                }
                const insertedId = await AlarmLogModel.create(alarmLog)                
                console.log(insertedId > 0 ? `Alarm Log inserted Ok with id: ${insertedId}`: 'Error inserting log'); 

                try {                    
                    const emailToSend = user.email;
                    
                    console.log('genero el token con estos datos: ',insertedId, user.id, alarm.id, alarm.canal_id);
                    const token = generateTokenAlarmLog(insertedId, user.id, alarm.id, alarm.canal_id, alarm.datalogger_id);
                    console.log('token: ', token);

                    const results = await sendMessage(alarm, variables, emailToSend, token);                    
                    //console.log(results);
                    if (results == true){
                        console.log('Email alarm sended OK !');                        
                    }else{
                        console.log('Error sending alarm email');
                }
                } catch (error) {
                    console.error('Error sending email alarm', error);
                }
            }
        }
    }
  }
}

export default new AlarmService();