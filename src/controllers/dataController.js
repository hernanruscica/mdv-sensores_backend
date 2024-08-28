import dataModel from "../models/dataModel.js";

export const getDataByTimePeriod = async (req, res, next) => {    
    try {
        const {table, timePeriod} = req.body;
        //console.log(table, timePeriod)
        const currentData = await dataModel.findAllByTimePeriod(table, timePeriod)
        if (currentData?.length > 0){
            return res.status(200).json({message: 'addresses Founded', count: currentData.length, data: currentData});
        }else{
            return res.status(400).json({message: 'addresses Not Found'});
        }
    } catch (error) {
        next(error);
    }
}