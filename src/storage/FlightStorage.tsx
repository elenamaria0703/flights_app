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

export  function GetTokenStorage(){

}

