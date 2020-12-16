import { useCamera } from '@ionic/react-hooks/camera';
import { CameraPhoto, CameraResultType, CameraSource, FilesystemDirectory } from '@capacitor/core';
import { base64FromPath, useFilesystem } from '@ionic/react-hooks/filesystem';
import { useState } from 'react';

export interface Photo {
    filepath: string;
    webviewPath?: string;
  }

export function usePhotoGallery() {
  const { getPhoto } = useCamera();
  const [photo, setPhoto] = useState<Photo>();

  const takePhoto = async (fileName:string) => {
    const cameraPhoto = await getPhoto({
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
      quality: 100
    });
    //const fileName = new Date().getTime() + '.jpeg';
    const savedFileImage = await savePicture(cameraPhoto, fileName);
    setPhoto(savedFileImage);
  };

  const updatePhoto= async(filepath: string) => {
    let currentPhoto: Photo = {
        filepath: filepath
    };
    const file = await readFile({
        path: currentPhoto.filepath,
        directory: FilesystemDirectory.Data
    });
    currentPhoto.webviewPath = `data:image/jpeg;base64,${file.data}`;
    setPhoto(currentPhoto);
}
    

  const {readFile, writeFile } = useFilesystem();
  const savePicture = async (photo: CameraPhoto, fileName: string): Promise<Photo> => {
    const base64Data = await base64FromPath(photo.webPath!);
    const savedFile = await writeFile({
      path: fileName,
      data: base64Data,
      directory: FilesystemDirectory.Data
    });

    return {
      filepath: fileName,
      webviewPath: photo.webPath
    };
  };

  return {
    photo,
    takePhoto,
    updatePhoto
  };
}
