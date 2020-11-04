import { IonContent, IonFab, IonFabButton, IonHeader, IonIcon, IonList, IonLoading, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import React, { useContext } from 'react';
import Flight from './Flight';
import { add } from 'ionicons/icons';
import { FlightContext } from './FlightProvider';
import { RouteComponentProps } from 'react-router';

const FlightList: React.FC<RouteComponentProps>=({history})=>{
    const{flights,fetching,fetchingError}=useContext(FlightContext);
    return(
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Flights</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <IonLoading isOpen={fetching} message="Fetching flights"/>
                {flights && (
                    <IonList>
                        {flights.map(({id,route,date,soldout}) => <Flight key={id} id={id} route={route} date={date} soldout={soldout} onEdit={id=>history.push(`/flight/${id}`)}/>)}
                    </IonList>
                )}
                {fetchingError && (
                    <div>{fetchingError.message || 'Failed to fetch flights'}</div>
                )}
                <IonFab vertical="bottom" horizontal="end" slot="fixed">
                <IonFabButton onClick={()=>history.push('/flight')}>
                    <IonIcon icon={add} />
                </IonFabButton>
                </IonFab>
            </IonContent>
        </IonPage>
    );
};

export default FlightList;