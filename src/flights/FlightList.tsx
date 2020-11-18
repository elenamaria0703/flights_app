import { IonContent, IonFab, IonFabButton, IonHeader, IonIcon, IonInfiniteScroll, IonInfiniteScrollContent, IonList, IonLoading, IonPage, IonSelect, IonSelectOption, IonTitle, IonToolbar } from '@ionic/react';
import React, { useContext, useEffect, useState } from 'react';
import Flight from './Flight';
import { add } from 'ionicons/icons';
import { FlightContext } from './FlightProvider';
import { RouteComponentProps } from 'react-router';

const FlightList: React.FC<RouteComponentProps>=({history})=>{
    const{flights,fetching}=useContext(FlightContext);
    const [filter, setFilter] = useState<string | undefined>(undefined);
    const [disableInfiniteScroll, setDisableInfiniteScroll] = useState<boolean>(false);
    useEffect(() => {
        
    }, [filter]);

    
    async function searchNext($event: CustomEvent<void>) {
       // await fetchData();
        ($event.target as HTMLIonInfiniteScrollElement).complete();
    }

    return(
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Flights</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <IonSelect value={filter} placeholder="Select Soldout" onIonChange={e => setFilter(e.detail.value)}>
                    <IonSelectOption key='true' value={true}>true</IonSelectOption>
                    <IonSelectOption key='false' value={false}>false</IonSelectOption>
                </IonSelect>
                <IonLoading isOpen={fetching} message="Fetching flights"/>
                {flights && (
                    <IonList>
                        {flights.map(({_id,route,date,soldout}) => <Flight key={_id} _id={_id} route={route} date={date} soldout={soldout} onEdit={id=>history.push(`/flight/${id}`)}/>)}
                    </IonList>
                )}
                <IonInfiniteScroll threshold="10px" disabled={disableInfiniteScroll}
                           onIonInfinite={(e: CustomEvent<void>) => searchNext(e)}>
                <IonInfiniteScrollContent
                    loadingText="Loading more flights...">
                </IonInfiniteScrollContent>
                </IonInfiniteScroll>
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