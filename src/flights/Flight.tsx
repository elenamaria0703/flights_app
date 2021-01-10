import { IonButton, IonCard, IonFab, IonFabButton, IonIcon, IonImg, IonItem, IonLabel, IonPopover } from '@ionic/react';
import React, { useEffect, useState } from 'react';
import {FlightProps} from './FlightProps'
import { usePhotoGallery } from './usePhotoGallery';
import { location } from 'ionicons/icons';
import { MyMap } from './MyMap';
import { createAnimation } from '@ionic/react';
interface FlightPropsExt extends FlightProps{
    onEdit: (_id?: string) => void;
}
const Flight: React.FC<FlightPropsExt>=({_id,route,date,soldout,version,filename,longitude,latitude,onEdit})=>{
    const soldoutVar=soldout ? "true":"false";
    const dateVar=date.toString();
    const {photo,updatePhoto } = usePhotoGallery();
    const [showPopover, setShowPopover] = useState<{open: boolean, event: Event | undefined}>({
        open: false,
        event: undefined,
      });
    const [animate,setAnimate]=useState<boolean>(true);
    useEffect(() => {
        if(filename)
       updatePhoto(filename);
    }, [])
    function groupAnimations(id?:string) {
        const elCard = document.querySelector('#card_'+id);
        const elLabel = document.querySelector('#lbl_'+id);
        if (elCard && elLabel) {
          const animationA = createAnimation()
            .fromTo('transform', 'scale(0.5)', 'scale(1)');
          const animationB = createAnimation()
            .fromTo('transform', 'scale(1)', 'scale(0.5)');
            if(animate){
                animationA.addElement(elCard);
                animationB.addElement(elLabel);
                setAnimate(false);
            }else{
                animationA.addElement(elLabel);
                animationB.addElement(elCard);
                setAnimate(true);
            }
          const parentAnimation = createAnimation()
            .duration(100)
            .addAnimation([animationA, animationB]);
          parentAnimation.play();    }
      }

    return(
        <IonItem>
            <IonLabel onClick={()=>onEdit(_id)} id={'lbl_'+_id}>{route} , {dateVar}, {soldoutVar}</IonLabel>
            <IonPopover
                isOpen={showPopover.open}
                event={showPopover.event}
                onDidDismiss={e => setShowPopover({open: false, event: undefined})}
            >
            <IonCard style={{height:"300px",width:"300px"}}>
            {latitude && longitude &&
                <MyMap
                lat={latitude}
                lng={longitude}
                />
            }
            </IonCard>
            </IonPopover>
            <IonFabButton onClick={(e) => setShowPopover({open: true, event: e.nativeEvent})}>
                <IonIcon icon={location}></IonIcon>
            </IonFabButton>
            <IonCard style={{height:"200px",width:"200px"}} id={'card_'+_id} onClick={()=>groupAnimations(_id)} >
                <IonImg src={photo?.webviewPath}/>
            </IonCard>
        </IonItem>
    );
};

export default Flight;