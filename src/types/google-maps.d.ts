
declare global {
  interface Window {
    google: {
      maps: {
        Map: any;
        Marker: any;
        InfoWindow: any;
        LatLng: any;
        Size: any;
        Circle: any;
        SymbolPath: {
          CIRCLE: number;
          FORWARD_CLOSED_ARROW: number;
          FORWARD_OPEN_ARROW: number;
        };
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
        ControlPosition: {
          TOP_CENTER: number;
          TOP_LEFT: number;
          TOP_RIGHT: number;
          LEFT_TOP: number;
          RIGHT_TOP: number;
          LEFT_CENTER: number;
          RIGHT_CENTER: number;
          LEFT_BOTTOM: number;
          RIGHT_BOTTOM: number;
          BOTTOM_CENTER: number;
          BOTTOM_LEFT: number;
          BOTTOM_RIGHT: number;
        };
      };
    };
  }
}

export {};
