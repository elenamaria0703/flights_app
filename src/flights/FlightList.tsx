import { IonAlert, IonButton, IonContent, IonFab, IonFabButton, IonHeader, IonIcon, IonLabel, IonList, IonLoading, IonModal, IonPage, IonSearchbar,  IonTitle, IonToolbar } from '@ionic/react';
import React, { useContext, useEffect, useState } from 'react';
import Flight from './Flight';
import { add,arrowDownCircle } from 'ionicons/icons';
import { FlightContext } from './FlightProvider';
import { RouteComponentProps } from 'react-router';
import { Plugins } from '@capacitor/core';
import { useNetwork } from '../network/useNetwork';

import { FlightProps } from './FlightProps';
const { Storage } = Plugins;

const FlightList: React.FC<RouteComponentProps>=({history})=>{
    const{flights,fetching,savingError,flightNotSaved,saveFlight}=useContext(FlightContext);
    const [searchFlight, setSearchFlight] = useState<string>('');
    const { networkStatus } = useNetwork();
    const [showAlert, setShowAlert] = useState(false);
    function handleLogOut(){
        (async() => {await Storage.clear()})();
        // eslint-disable-next-line no-restricted-globals
        location.reload();
        //history.push('/login')
    }

    useEffect(() => {
        if(savingError?.message==="Version conflict"){
            setShowAlert(true);
        }
    }, [savingError])

    useEffect(() => {
        if(networkStatus.connected)
        { 
            (async()=>{
                try{
                    const { keys } = await Storage.keys();
                    let save_flights;
                    if(keys.includes('save_flight')){
                        const res = await Storage.get({ key: 'save_flight' });
                        if(res.value){
                            save_flights=JSON.parse(res.value);
                            save_flights.forEach((f: FlightProps)=>{
                                saveFlight?.(f);
                            });
                        }
                    }
                }finally{
                    await Storage.remove({ key: 'save_flight' });
                }
                
            })();   
        }
    }, [networkStatus, saveFlight])
    return(
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Flights</IonTitle>
                    <IonButton onClick={handleLogOut}>Log out</IonButton>
                    <IonLabel style={{color:"#5c85d6", font:"Arial",  fontSize:"24px"}}>{networkStatus.connected ?  " Online": " Offline"}</IonLabel>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <IonAlert
                     isOpen={showAlert}
                     onDidDismiss={() => setShowAlert(false)}
                     cssClass='my-custom-class'
                     header={'Confirm!'}
                     message={flightNotSaved?.route + "    "+savingError?.message}
                     buttons={[
                       {
                         text: 'Discard Changes',
                         role: 'cancel',
                         cssClass: 'secondary',
                         handler: () => {
                            // eslint-disable-next-line no-restricted-globals
                            location.reload();
                         }
                       },
                       {
                         text: 'Keep Changes',
                         handler: () => {
                           const newFlight=flightNotSaved;
                           if(newFlight){
                            newFlight.version=newFlight.version+1;
                            saveFlight?.(newFlight);
                           }
                        }
                       }
                     ]}
                />
                <IonSearchbar
                    value={searchFlight}
                    debounce={1000}
                    onIonChange={e => setSearchFlight(e.detail.value!)}>
                </IonSearchbar>
                <IonLoading isOpen={fetching} message="Fetching flights"/>
                {flights && (
                    <IonList>
                        {flights
                            .filter(flight => flight.route.indexOf(searchFlight) >= 0)
                            .map(({_id,route,date,soldout,version}) => <Flight key={_id} _id={_id} route={route} date={date} soldout={soldout} version={version} onEdit={id=>history.push(`/flight/${id}`)}/>)}
                    </IonList>
                )}
                <IonFab vertical="bottom" horizontal="end" slot="fixed">
                    <IonFabButton onClick={()=>history.push('/flight')}>
                        <IonIcon icon={add} />
                    </IonFabButton>
                    <IonFabButton onClick={()=>history.push('/filter')}>
                        <IonIcon icon={arrowDownCircle}/>
                    </IonFabButton>
                </IonFab>
            </IonContent>
        </IonPage>
    );
};

export default FlightList;