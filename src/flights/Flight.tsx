import { IonItem, IonLabel } from '@ionic/react';
import React from 'react';
import {FlightProps} from './FlightProps'

interface FlightPropsExt extends FlightProps{
    onEdit: (_id?: string) => void;
}
const Flight: React.FC<FlightPropsExt>=({_id,route,date,soldout,version,onEdit})=>{
    const soldoutVar=soldout ? "true":"false";
    const dateVar=date.toString();
    return(
        <IonItem onClick={()=>onEdit(_id)}>
            <IonLabel>{route} , {dateVar}, {soldoutVar}</IonLabel>
        </IonItem>
    );
};

export default Flight;