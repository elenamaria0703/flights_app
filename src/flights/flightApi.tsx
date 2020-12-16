import axios from 'axios';
import { authConfig, baseUrl, getLogger, withLogs } from '../core';
import { FlightProps } from './FlightProps';

const flightUrl = `http://${baseUrl}/api/flight`;

export const getFlights: (token: string) => Promise<FlightProps[]> = token => {
  console.log(token);
  return withLogs(axios.get(flightUrl, authConfig(token)), "Log in");
}

export const getFlightsPage: (token: string,page:string,filter:string) => Promise<FlightProps[]> = (token,page,filter) => {
  console.log(token);
  return withLogs(axios.get(`${flightUrl}/${filter}/${page}`, authConfig(token)), 'getFlights');
}

export const createFlight: (token: string, flight: FlightProps) => Promise<FlightProps[]> = (token, flight) => {
  return withLogs(axios.post(flightUrl, flight, authConfig(token)), 'createFlight');
}

export const updateFlight: (token: string, flight: FlightProps, saveChanges: boolean) => Promise<FlightProps[]> = (token, flight,saveChanges) => {
  console.log(token);
  return withLogs(axios.put(`${flightUrl}/${flight._id}`, {flight, saveChanges}, authConfig(token)), 'updateFlight');
}

interface MessageData {
  type: string;
  payload: FlightProps;
}

const log = getLogger('ws');

export const newWebSocket = (token: string, onMessage: (data: MessageData) => void) => {
  const ws = new WebSocket(`ws://${baseUrl}`);
  ws.onopen = () => {
    log('web socket onopen');
    ws.send(JSON.stringify({ type: 'authorization', payload: { token } }));
  };
  ws.onclose = () => {
    log('web socket onclose');
  };
  ws.onerror = error => {
    log('web socket onerror', error);
  };
  ws.onmessage = messageEvent => {
    log('web socket onmessage');
    onMessage(JSON.parse(messageEvent.data));
  };
  return () => {
    ws.close();
  }
}
