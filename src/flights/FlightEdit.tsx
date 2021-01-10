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
import { createAnimation } from '@ionic/react';
import { getLogger } from '../core';
import { FlightContext } from './FlightProvider';
import { RouteComponentProps } from 'react-router';
import { FlightProps } from './FlightProps';
import { camera,location } from 'ionicons/icons';
import { usePhotoGallery } from './usePhotoGallery';
import { useMyLocation } from './useMyLocation';
import { MyMap } from './MyMap';

interface FlightEditProps extends RouteComponentProps<{
    id?: string;
  }> {}

const FlightEdit: React.FC<FlightEditProps> = ({ history, match }) => {
    const { flights, saving, savingError, saveFlight } = useContext(FlightContext);
    const [route,setRoute] = useState('');
    const [soldout,setSoldout]=useState(false);
    const [flight, setFlight] = useState<FlightProps>();
    const {photo, takePhoto,updatePhoto } = usePhotoGallery();
    const [filename, setFileName] = useState(new Date().getTime() + '.jpeg')
    const [latitude, setLatitude] = useState<number | undefined>(undefined);
    const [longitude, setLongitude] = useState<number | undefined>(undefined);
  
    const [currLatitude, setCurrLatitude] = useState<number | undefined>(undefined);
    const [currLongitude, setCurrLongitude] = useState<number | undefined>(undefined);
   
    // for map
    const myLocation = useMyLocation();
    const { latitude: lat, longitude: lng } = myLocation.position?.coords || {};

    useEffect(() => {
      const routeId = match.params.id || '';
      const flight = flights?.find(fl => fl._id === routeId);
      setFlight(flight);
      if (flight) {
        setRoute(flight.route);
        setSoldout(flight.soldout);
      }
      if(flight?.filename){
        updatePhoto(flight.filename);
        setFileName(flight.filename);
      }
      setLatitude(flight?.latitude);
      setLongitude(flight?.longitude);
    }, [match.params.id, flights]);

    useEffect( () => {
      if(latitude == undefined && longitude == undefined){
        setCurrLatitude(lat);
        setCurrLongitude(lng);
      }else{
        setCurrLatitude(latitude);
        setCurrLongitude(longitude);
      }
    }, [lat, lng, longitude, latitude]);

    function change(source: string) {
      return (e: any) => {
        setCurrLatitude(e.latLng.lat());
        setCurrLongitude(e.latLng.lng());
        console.log(source, e.latLng.lat(), e.latLng.lng());
      };
    }
    const handleSave = () => {
      if(!route){
        alert('empty route');
        return;
      }
      const date=new Date(Date.now());
      const editedFlight = flight ? { ...flight,route,soldout,version: flight.version+1,filename,longitude: currLongitude,latitude: currLatitude} : {route,soldout,date,version:1,filename,longitude: currLongitude,latitude: currLatitude};
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
          <IonLabel id='route'>Route:
            <IonInput value={route} onIonChange={e => setRoute(e.detail.value || '')} />
          </IonLabel>
          <IonLabel id='soldout'>Soldout:
            <IonInput value={soldout?'true':'false'} onIonChange={e => {if(e.detail.value==='true') setSoldout(true); else setSoldout(false); }}/>
          </IonLabel>
          <IonCard style={{height:"200px",width:"200px"}} id='img'>
            <IonImg src={photo?.webviewPath}/>
          </IonCard>
          <IonFab vertical="bottom" horizontal="center" slot="fixed">
            <IonFabButton onClick={() => takePhoto(filename)}>
              <IonIcon icon={camera}></IonIcon>
            </IonFabButton>
          </IonFab>
          <IonCard style={{height:"300px",width:"300px"}}>
          {currLatitude && currLongitude &&
            <MyMap
              lat={currLatitude}
              lng={currLongitude}
              onMapClick={change('onMap')}
              onMarkerClick={change('onMarker')}
            />
          }
          </IonCard>
          <IonLoading isOpen={saving} />
          {savingError && (
            <div>{savingError.message || 'Failed to save item'}</div>
          )}
        </IonContent>
      </IonPage>
    );
};
  
export default FlightEdit;
  