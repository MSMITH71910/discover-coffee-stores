'use client';

import { useState } from 'react';

type PositionType = {
  coords: { latitude: number; longitude: number };
};

const useTrackLocation = () => {
  console.log('useTrackLocation hook initialized');
  const [isFindingLocation, setIsFindingLocation] = useState(false);
  const [longLat, setLongLat] = useState('');
  const [locationErrorMsg, setLocationErrorMsg] = useState('');

  function success(position: PositionType) {
    console.log('SUCCESS: Geolocation success callback called', position);
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;
    console.log(`Raw coordinates - Latitude: ${latitude}, Longitude: ${longitude}`);

    const formattedLongLat = `${longitude},${latitude}`;
    console.log('Setting longLat to:', formattedLongLat);
    
    setLongLat(formattedLongLat);
    setIsFindingLocation(false);
    setLocationErrorMsg('');
    console.log(`SUCCESS: Location set - Latitude: ${latitude} °, Longitude: ${longitude} °`);
  }

  function error(err: GeolocationPositionError) {
    console.log('ERROR: Geolocation error callback called', err);
    setIsFindingLocation(false);
    setLocationErrorMsg('Unable to retrieve your location');
    console.error('Unable to retrieve your location', err);
  }

  const handleTrackLocation = () => {
    console.log('handleTrackLocation called');
    if (!navigator.geolocation) {
      console.log('Geolocation is not supported by your browser');
      setLocationErrorMsg('Geolocation is not supported by your browser');
    } else {
      console.log('Locating…');
      setIsFindingLocation(true);
      setLocationErrorMsg('');
      navigator.geolocation.getCurrentPosition(success, error);
    }
  };

  console.log('useTrackLocation returning:', { 
    longLat, 
    isFindingLocation, 
    handleTrackLocation: typeof handleTrackLocation, 
    locationErrorMsg 
  });
  
  return {
    longLat,
    isFindingLocation,
    handleTrackLocation,
    locationErrorMsg,
  };
};

export default useTrackLocation;
