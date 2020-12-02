import { Plugins } from '@capacitor/core';
const { Storage } = Plugins;
export  function TokenStorage(token: string){
    (async () => {
        await Storage.set({
            key: 'token',
            value: token
        });
    })();
}

export function isTokenSet() : Promise<boolean>{
    return (async () => {
        const res = await Storage.get({ key: 'token' });
        if (res.value) {
            return true;
        }
        return false;
    })();
}

export  function GetTokenStorage(){
    (async () => {
        const res = await Storage.get({ key: 'token' });
        if (res.value) {
            return res.value;
        }
    })();

}


