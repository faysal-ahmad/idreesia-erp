export interface CurrentLocation {
  latitude: number;
  longitude: number;
  /** Metres. */
  accuracy?: number;
}

const LOCATION_TIMEOUT_MS = 15000;

/**
 * The device's current position, for stamping an attendance with where it was
 * marked. Rejects with a message that can be shown to the user when the
 * permission is denied or no position can be found.
 */
export const getCurrentLocation = (): Promise<CurrentLocation> =>
  new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('This device cannot tell where you are.'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) =>
        resolve({
          latitude: coords.latitude,
          longitude: coords.longitude,
          ...(Number.isFinite(coords.accuracy) ? { accuracy: coords.accuracy } : {}),
        }),
      error =>
        reject(
          new Error(
            error.code === error.PERMISSION_DENIED
              ? 'Allow location access to mark your attendance.'
              : 'Could not find your location. Try again.'
          )
        ),
      { enableHighAccuracy: true, timeout: LOCATION_TIMEOUT_MS, maximumAge: 0 }
    );
  });
