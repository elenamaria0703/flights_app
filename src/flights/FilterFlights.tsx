import { IonInfiniteScroll, IonInfiniteScrollContent, IonSelect, IonSelectOption, useIonViewWillEnter } from '@ionic/react'
import React, { useContext, useEffect, useState } from 'react'
import { RouteComponentProps } from 'react-router';
import { IonContent, IonFab, IonFabButton, IonHeader, IonIcon, IonList, IonPage  ,IonTitle, IonToolbar } from '@ionic/react';
import Flight from './Flight';
import { arrowBack } from 'ionicons/icons';
// import { FlightContext } from './FlightProvider';
import { AuthContext } from '../auth';
import { FlightProps } from './FlightProps';
import { getFlightsPage } from './flightApi';
import { Plugins } from '@capacitor/core';
const { Storage } = Plugins;



const FilterFlights: React.FC<RouteComponentProps>=({history})=>{
    const { token } = useContext(AuthContext);
    const [filter, setFilter] = useState<string>("none");
    const [flights,setFlights]= useState<FlightProps[]>([]);
    const [page,setPage]= useState<string>("1");
    const [disableInfiniteScroll, setDisableInfiniteScroll] = useState<boolean>(false);

    async function fetchData(reset?: boolean) {
        const items: FlightProps[] = reset ? [] : flights;
        const crtPage: string = reset ? "1" : page;
        if(token === ""){
            (async () => {
            const res = await Storage.get({ key: 'token' });
            if (res.value) {
                const flights_page=await getFlightsPage(res.value,crtPage,filter);
                setFlights([...items, ...flights_page]);
                if(flights_page.length<14){
                    setDisableInfiniteScroll(true);
                }
            }
           })();
        }
        else{
            const flights_page=await getFlightsPage(token,crtPage,filter);
            setFlights([...items, ...flights_page]);
            if(flights_page.length<14){
                setDisableInfiniteScroll(true);
            }
        }
        
        const nextPage= String(parseInt(crtPage)+1);
        setPage(nextPage);
      }

      async function searchNext($event: CustomEvent<void>) {
        await fetchData();
        ($event.target as HTMLIonInfiniteScrollElement).complete();
      }

      useIonViewWillEnter(async () => {
        await fetchData();
      });

      useEffect(() => {
        fetchData(true);
      }, [filter]);
    

    return(
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Flights</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <IonSelect value={filter} placeholder="Select Soldout" onIonChange={e =>{
                    setFilter(e.detail.value);
                    setDisableInfiniteScroll(false);
                } }>
                    <IonSelectOption key='true' value="true">true</IonSelectOption>
                    <IonSelectOption key='false' value="false">false</IonSelectOption>
                    <IonSelectOption key='false' value="none">none</IonSelectOption>
                </IonSelect>
                {flights && (
                    <IonList>
                        {flights
                            .map(({_id,route,date,soldout}) => <Flight key={_id} _id={_id} route={route} date={date} soldout={soldout} onEdit={id=>history.push(`/flight/${id}`)}/>)}
                    </IonList>
                )}
                <IonInfiniteScroll threshold="100px" disabled={disableInfiniteScroll}
                                onIonInfinite={(e: CustomEvent<void>) => searchNext(e)}>
                    <IonInfiniteScrollContent
                        loadingText="Loading more flights...">
                    </IonInfiniteScrollContent>
                </IonInfiniteScroll>
                <IonFab vertical="bottom" horizontal="end" slot="fixed">
                    <IonFabButton onClick={()=>history.push('/flights')}>
                        <IonIcon icon={arrowBack}/>
                    </IonFabButton>
                </IonFab>
            </IonContent>
        </IonPage>
    );
};

export default FilterFlights;