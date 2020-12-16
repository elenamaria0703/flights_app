import React, { useContext, useEffect, useState } from 'react';
import {
  IonButton,
  IonButtons,
  IonCard,
  IonContent,
  IonFab,
  IonFabButton,
  IonHeader,
  IonIcon,
  IonImg,
  IonInput,
  IonLabel,
  IonLoading,
  IonPage,
  IonTitle,
  IonToolbar
} from '@ionic/react';
import { getLogger } from '../core';
import { FlightContext } from './FlightProvider';
import { RouteComponentProps } from 'react-router';
import { FlightProps } from './FlightProps';
import { camera } from 'ionicons/icons';
import { usePhotoGallery } from './usePhotoGallery';

interface FlightEditProps extends RouteComponentProps<{
    id?: string;
  }> {}

const FlightEdit: React.FC<FlightEditProps> = ({ history, match }) => {
    const { flights, saving, savingError, saveFlight } = useContext(FlightContext);
    const [route,setRoute] = useState('');
    const [soldout,setSoldout]=useState(false);
    const [flight, setFlight] = useState<FlightProps>();
   // const {photo, takePhoto,updatePhoto } = usePhotoGallery();

    useEffect(() => {
      const routeId = match.params.id || '';
      const flight = flights?.find(fl => fl._id === routeId);
      setFlight(flight);
      if (flight) {
        setRoute(flight.route);
        setSoldout(flight.soldout);
      }
    }, [match.params.id, flights]);

    const handleSave = () => {
      const date=new Date(Date.now());
      const editedFlight = flight ? { ...flight,route,soldout,version: flight.version+1} : {route,soldout,date,version:1};
      saveFlight && saveFlight(editedFlight).then(() => history.goBack());
    };

    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Edit</IonTitle>
            <IonButtons slot="end">
              <IonButton onClick={handleSave}>
                Save
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <IonLabel>Route:
            <IonInput value={route} onIonChange={e => setRoute(e.detail.value || '')} />
          </IonLabel>
          <IonLabel>Soldout:
            <IonInput value={soldout?'true':'false'} onIonChange={e => {if(e.detail.value==='true') setSoldout(true); else setSoldout(false)}}/>
          </IonLabel>
          {/* <IonCard style={{height:"200px",width:"200px"}}>
            <IonImg src={photo?.webviewPath}/>
          </IonCard>
          <IonFab vertical="bottom" horizontal="center" slot="fixed">
          <IonFabButton onClick={() => takePhoto()}>
            <IonIcon icon={camera}></IonIcon>
          </IonFabButton>
          </IonFab> */}
          <IonLoading isOpen={saving} />
          {savingError && (
            <div>{savingError.message || 'Failed to save item'}</div>
          )}
        </IonContent>
      </IonPage>
    );
};
  
export default FlightEdit;
  