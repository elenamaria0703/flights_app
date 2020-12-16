import { IonCard, IonImg, IonItem, IonLabel } from '@ionic/react';
import React, { useEffect } from 'react';
import {FlightProps} from './FlightProps'
import { usePhotoGallery } from './usePhotoGallery';

interface FlightPropsExt extends FlightProps{
    onEdit: (_id?: string) => void;
}
const Flight: React.FC<FlightPropsExt>=({_id,route,date,soldout,version,filename,onEdit})=>{
    const soldoutVar=soldout ? "true":"false";
    const dateVar=date.toString();
    const {photo,updatePhoto } = usePhotoGallery();
    useEffect(() => {
        if(filename)
       updatePhoto(filename);
    }, [])
    return(
        <IonItem onClick={()=>onEdit(_id)}>
            <IonLabel>{route} , {dateVar}, {soldoutVar}</IonLabel>
            <IonCard style={{height:"200px",width:"200px"}}>
                <IonImg src={photo?.webviewPath}/>
            </IonCard>
        </IonItem>
    );
};

export default Flight;