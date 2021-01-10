
export interface FlightProps{
    _id?: string;
    route: string;
    date: Date;
    soldout: boolean;
    version: number;
    filename?: string;
    longitude?:number;
    latitude?:number;
}