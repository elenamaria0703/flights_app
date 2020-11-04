import { IonItem, IonLabel } from '@ionic/react';
import React from 'react';
import {FlightProps} from './FlightProps'

interface FlightPropsExt extends FlightProps{
    onEdit: (id?: string) => void;
}
const Flight: React.FC<FlightPropsExt>=({id,route,date,soldout, onEdit})=>{
    const soldoutVar=soldout ? "true":"false";
    const dateVar=date.toString();
    return(
        <IonItem onClick={()=>onEdit(id)}>
            <IonLabel>Route: {route} ,Date: {dateVar}, Soldout: {soldoutVar}</IonLabel>
        </IonItem>
    );
};

export default Flight;