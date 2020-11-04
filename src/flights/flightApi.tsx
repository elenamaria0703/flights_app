import axios from 'axios';
import { getLogger } from '../core';
import Flight from './Flight';
import { FlightProps } from './FlightProps';

const baseUrl='localhost:3000';
const flightsUrl=`http://${baseUrl}/flights`;
const flightUrl=`http://${baseUrl}/flight`;
const log = getLogger('flightApi');
const config = {
    headers: {
        'Content-Type':'application/json'
    }
};
interface ResponseProps<T> {
    data: T;
  }
  
  function withLogs<T>(promise: Promise<ResponseProps<T>>, fnName: string): Promise<T> {
    log(`${fnName} - started`);
    return promise
      .then(res => {
        log(`${fnName} - succeeded`);
        return Promise.resolve(res.data);
      })
      .catch(err => {
        log(`${fnName} - failed`);
        return Promise.reject(err);
      });
  }

export const getFlights: () => Promise<FlightProps[]> = () => {
    return withLogs(axios.get(flightsUrl,config),'getFlights');
}

export const createFlight: (flight: FlightProps) => Promise<FlightProps[]> = flight =>{
    return withLogs(axios.post(flightUrl,flight,config),'createFlight');
}

export const updateFlight: (flight: FlightProps) => Promise<FlightProps[]> = flight =>{
    return withLogs(axios.put(`${flightUrl}/${flight.id}`,flight,config),'updateFlight');
}

interface MessageData{
  event: string;
  payload:{
    flight: FlightProps;
  };
}

export const newWebSocket = (onMessage: (data: MessageData)=>void)=>{
  const ws = new WebSocket(`ws://${baseUrl}`)
  ws.onopen = () => {
    log('web socket onopen');
  };
  ws.onclose = () => {
    log('web socket onclose');
  };
  ws.onerror = error => {
    log('web socket onerror');
  };
  ws.onmessage = messageEvent => {
    log('web socket onmessage');
    onMessage(JSON.parse(messageEvent.data));
  };
  return () => {
    ws.close();
  }
}