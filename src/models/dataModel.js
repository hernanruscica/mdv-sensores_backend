import {poolData} from '../config/database.js';
import dotenv from 'dotenv';

dotenv.config();

const dataModel = {
    findAllByTimePeriod: async (table, timePeriod) => {
        const queryString = `SELECT * FROM ${table} WHERE fecha >= DATE_SUB(NOW(), INTERVAL ${timePeriod}) AND fecha <= NOW();`;
        const [rows] = await poolData.query(queryString);    
        return rows;
      }
}
export default dataModel;