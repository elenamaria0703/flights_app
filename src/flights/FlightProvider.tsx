import {useState,useEffect, useReducer, ReactPropTypes, useCallback} from 'react';
import Flight from './Flight';
import {FlightProps} from './FlightProps'
import {createFlight, getFlights, updateFlight,newWebSocket} from './flightApi'
import React from 'react';
import PropTypes from 'prop-types';

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
    playload?: any,
}

const initialState: FlightsState = {
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
    (state, {type,playload}) => {
        switch(type){
            case FETCH_FLIGHTS_STARTED:
                return {...state, fetching:true};
            case FETCH_FLIGHTS_SUCCEEDED:
                return {...state, flights:playload.flights, fetching:false};
            case FETCH_FLIGHTS_FAILED:
                return {...state, fetchingError:playload.error, fetching: false};
            case SAVE_FLIGHT_STARTED:
                return {...state, savingError: null, saving:true};
            case SAVE_FLIGHT_SUCCEEDED:
                const flights=[...(state.flights || [])]
                const flight=playload.flight;
                const index=flights.findIndex(fl=>fl.id===flight.id);
                if(index === -1){
                    flights.splice(0,0,flight);
                }else{
                    flights[index]=flight;
                }
                return {...state,flights,saving:false};
            case SAVE_FLIGHT_FAILED:
                return {...state,savingError:playload.error,saving:false}
            default:
                return state;
        }
    };

export const FlightContext = React.createContext<FlightsState>(initialState);

interface FlightProviderProps{
    children: PropTypes.ReactNodeLike,
}
export const FlightProvider: React.FC<FlightProviderProps>=({children})=>{
    const [state, dispatch] = useReducer(reducer, initialState)

    const {flights, fetching, fetchingError,saving,savingError}= state;

    useEffect(getFlightsEffect, []);
    useEffect(wsEffect,[]);

    const saveFlight=useCallback<SaveFlightFn>(saveFlightCallback,[]);
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
                const flights=await getFlights();
                if(!canceled){
                   dispatch({type:FETCH_FLIGHTS_SUCCEEDED, playload: {flights}})
                }
            }catch(error){
                dispatch({type:FETCH_FLIGHTS_FAILED, playload:{error}})
            }
        }
    }

    async function saveFlightCallback(flight : FlightProps){
        try{
            dispatch({type:SAVE_FLIGHT_STARTED});
            const savedFlight= await (flight.id? updateFlight(flight):createFlight(flight));
            dispatch({type:SAVE_FLIGHT_SUCCEEDED,playload:{flight: savedFlight}})
        }catch(error){
            dispatch({type:SAVE_FLIGHT_FAILED, playload:{error}})
        }
    }

    function wsEffect(){
        let canceled = false;
        const closeWebSocket = newWebSocket(message => {
            if (canceled) {
                return;
            }
            const { event, payload: { flight }} = message;
            if (event === 'created' || event === 'updated') {
                dispatch({ type: SAVE_FLIGHT_SUCCEEDED, playload: { flight } });
            }
        });
        return () => {
            canceled = true;
            closeWebSocket();
        }
    }
};