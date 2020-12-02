import {useState,useEffect, useReducer, useCallback, useContext} from 'react';
import Flight from './Flight';
import {FlightProps} from './FlightProps'
import {createFlight, getFlights,updateFlight,newWebSocket} from './flightApi'
import React from 'react';
import PropTypes from 'prop-types';
import { AuthContext } from '../auth';
import { Plugins } from '@capacitor/core';
import { useNetwork } from '../network/useNetwork';
const { Storage } = Plugins;

type SaveFlightFn = (flight : FlightProps) => Promise<any>;

export interface FlightsState{
    flights?: FlightProps[],
    fetching: boolean,
    fetchingError?:Error | null,
    saving: boolean,
    savingError?: Error | null,
    saveFlight?: SaveFlightFn,
}

interface ActionProps{
    type: string,
    payload?: any,
}

const initialState: FlightsState = {
    fetchingError:null,
    fetching: false,
    saving: false,
};
const FETCH_FLIGHTS_STARTED = 'FETCH_FLIGHTS_STARTED';
const FETCH_FLIGHTS_SUCCEEDED = 'FETCH_FLIGHTS_SUCCEEDED';
const FETCH_FLIGHTS_FAILED = 'FETCH_FLIGHTS_FAILED';
const SAVE_FLIGHT_STARTED = 'SAVE_FLIGHT_STARTED';
const SAVE_FLIGHT_SUCCEEDED = 'SAVE_FLIGHT_SUCCEEDED';
const SAVE_FLIGHT_FAILED = 'SAVE_FLIGHT_FAILED';

const reducer: (state: FlightsState, action: ActionProps)=> FlightsState =
    (state, {type,payload}) => {
        switch(type){
            case FETCH_FLIGHTS_STARTED:
                return {...state, fetching:true};
            case FETCH_FLIGHTS_SUCCEEDED:
                let i=0;
                payload.flights.forEach((flight: FlightProps)=>{
                    (async() => {await Storage.set({
                        key: 'flight'+ i.toString() ,
                        value: JSON.stringify({
                          route: flight.route, date: flight.date, soldout:flight.soldout
                        })
                      })})();
                      i++;
                
                });
                return {...state, flights:payload.flights, fetching:false};
            case FETCH_FLIGHTS_FAILED:
                return {...state, flights:payload.storage, fetching:false};
            case SAVE_FLIGHT_STARTED:
                return {...state, savingError: null, saving:true};
            case SAVE_FLIGHT_SUCCEEDED:
                const flights=[...(state.flights || [])]
                const flight=payload.flight;
                const index=flights.findIndex(fl=>fl._id===flight._id);
                if(index === -1){
                    flights.splice(0,0,flight);
                }else{
                    flights[index]=flight;
                }
                return {...state,flights,saving:false};
            case SAVE_FLIGHT_FAILED:
                alert(payload.flight.route+" "+payload.flight.date+"\n"+payload.error)
                return {...state,savingError:payload.error,saving:false}
            default:
                return state;
        }
    };

export const FlightContext = React.createContext<FlightsState>(initialState);

interface FlightProviderProps{
    children: PropTypes.ReactNodeLike,
}
export const FlightProvider: React.FC<FlightProviderProps>=({children})=>{
    const { token } = useContext(AuthContext);
    const [state, dispatch] = useReducer(reducer, initialState)
    const { networkStatus } = useNetwork();
    
    const {flights, fetching, fetchingError,saving,savingError}= state;

    useEffect(getFlightsEffect, [token]);
    useEffect(wsEffect,[token]);

    const saveFlight=useCallback<SaveFlightFn>(saveFlightCallback,[token]);
    const value={flights, fetching, fetchingError,saving,savingError,saveFlight}

    return (
        <FlightContext.Provider value={value}>
            {children}
        </FlightContext.Provider>
    );
    function getFlightsEffect(){
        let canceled=false;
        fetchFlights();
        return () =>{
            canceled=true;
        }
        async function fetchFlights(){
            try{
                dispatch({type:FETCH_FLIGHTS_STARTED});
                if(token === ""){
                        const res = await Storage.get({ key: 'token' });
                        if (res.value) {
                            const flights=await getFlights(res.value);
                            if(!canceled){
                                dispatch({type:FETCH_FLIGHTS_SUCCEEDED, payload: {flights}});
                            }
                        }
                }
                else{
                    const flights=await getFlights(token);
                    if(!canceled){
                        dispatch({type:FETCH_FLIGHTS_SUCCEEDED, payload: {flights}});
                     }
                }
            }catch(error){
                let storage: FlightProps[]=[];
                const { keys } = await Storage.keys();
                const len=keys.length-1;
                for(let i=0;i<len;i++){
                    const res=await Storage.get({ key: 'flight'+i.toString() });
                    if(res.value){
                        storage.push(JSON.parse(res.value));
                    }
                }
                dispatch({type:FETCH_FLIGHTS_FAILED, payload:{storage}})
            }
        }
    }

    async function saveFlightCallback(flight : FlightProps){
        try{
            if(!networkStatus.connected)  throw new Error("This item could not be saved due to a network failure. Go back online.")
            dispatch({type:SAVE_FLIGHT_STARTED});
            const savedFlight= await (flight._id? updateFlight(token,flight):createFlight(token,flight));
            dispatch({type:SAVE_FLIGHT_SUCCEEDED,payload:{flight: savedFlight}})
        }catch(error){
            await Storage.set({
                key: 'save_flight'+flight.date,
                value: JSON.stringify(flight)
            });
            dispatch({type:SAVE_FLIGHT_FAILED, payload:{error,flight}})
        }
    }

    function wsEffect() {
        let canceled = false;
      
        let closeWebSocket: () => void;
        if (token?.trim()) {
          closeWebSocket = newWebSocket(token, message => {
            if (canceled) {
              return;
            }
            const { type, payload: flight } = message;
         
            if (type === 'created' || type === 'updated') {
              dispatch({ type: SAVE_FLIGHT_SUCCEEDED, payload: { flight } });
            }
          });
        }
        return () => {
          canceled = true;
          closeWebSocket?.();
        }
      }
};