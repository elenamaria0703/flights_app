import { IonButton, IonContent, IonFab, IonFabButton, IonHeader, IonIcon, IonLabel, IonList, IonLoading, IonPage, IonSearchbar,  IonTitle, IonToolbar } from '@ionic/react';
import React, { useContext, useState } from 'react';
import Flight from './Flight';
import { add,arrowDownCircle } from 'ionicons/icons';
import { FlightContext } from './FlightProvider';
import { RouteComponentProps } from 'react-router';
import { Plugins } from '@capacitor/core';
import { useNetwork } from '../network/useNetwork';
import { useBackgroundTask } from '../network/useBackgroundTask';
const { Storage } = Plugins;

const FlightList: React.FC<RouteComponentProps>=({history})=>{
    const{flights,fetching,saveFlight}=useContext(FlightContext);
    const [searchFlight, setSearchFlight] = useState<string>('');
    const { networkStatus } = useNetwork();
    useBackgroundTask(() => new Promise(resolve => {
        console.log('My Background Task');
        resolve();
    }));
    function handleLogOut(){
        (async() => {await Storage.clear()})();
        // eslint-disable-next-line no-restricted-globals
        location.reload();
        //history.push('/login')
    }
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
                            .map(({_id,route,date,soldout}) => <Flight key={_id} _id={_id} route={route} date={date} soldout={soldout} onEdit={id=>history.push(`/flight/${id}`)}/>)}
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