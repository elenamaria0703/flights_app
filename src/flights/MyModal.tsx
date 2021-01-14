import React, { useState } from 'react';
import { createAnimation, IonModal, IonButton, IonContent } from '@ionic/react';

export const MyModal: React.FC = () => {
  const [showModal, setShowModal] = useState(false);

  const enterAnimation = (baseEl: any) => {
    const backdropAnimation = createAnimation()
      .addElement(baseEl.querySelector('ion-backdrop')!)
      .fromTo('opacity', '0.01', 'var(--backdrop-opacity)');

    const wrapperAnimation = createAnimation()
      .addElement(baseEl.querySelector('.modal-wrapper')!)
      .keyframes([
        { offset: 0, opacity: '0', transform: 'scale(0)' },
        { offset: 1, opacity: '0.99', transform: 'scale(1)' }
      ]);

    return createAnimation()
      .addElement(baseEl)
      .easing('ease-out')
      .duration(500)
      .addAnimation([backdropAnimation, wrapperAnimation]);
  }

  const leaveAnimation = (baseEl: any) => {
    return enterAnimation(baseEl).direction('reverse');
  }

  return (
    <>
      <IonModal isOpen={showModal} enterAnimation={enterAnimation} leaveAnimation={leaveAnimation}>
        <p>This app is amazing!</p>
        <p>In this app you can create and add flights from all over the world</p>
        <p>Moreover you can add location and photos to customize your flight</p>
        <p>And it has the most amazing animations of all time!</p>
        <p>Enjoy!!</p>
        <IonButton onClick={() => setShowModal(false)}>Close</IonButton>
      </IonModal>
      <IonButton style={{float:"right"}} onClick={() => setShowModal(true)}>About</IonButton>
    </>
  );
};
