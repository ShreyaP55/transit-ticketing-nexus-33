
declare global {
  interface Window {
    google: {
      maps: {
        Map: any;
        Marker: any;
        InfoWindow: any;
        LatLng: any;
        Size: any;
        MapTypeId: {
          ROADMAP: string;
          SATELLITE: string;
          HYBRID: string;
          TERRAIN: string;
        };
        Animation: {
          DROP: number;
          BOUNCE: number;
        };
      };
    };
  }
}

export {};
