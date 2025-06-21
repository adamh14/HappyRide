// types.ts

// Definice pro jednu zastávku
export interface Stop {
    id: number;
    name: string;
}

// Definice pro poznámku (např. 'na znamení')
export interface Note {
    id: number;
    symbol: string;
    text: string;
}

// Definice pro jedno zastavení v rámci spoje
export interface StopEvent {
    stopId: number;
    arrival: string | null;
    departure: string | null;
    notes?: number[]; // Poznámky specifické pro toto zastavení
}

// Definice pro jeden spoj (cestu)
export interface Service {
    id: number;
    notes: number[]; // Poznámky platné pro celý spoj
    schedule: StopEvent[];
}

// Definice pro linku
export interface Line {
    id: string;
    lineNumber: string;
    description: string;
    services: Service[];
}

// Definice pro celý objekt jízdního řádu
export interface Timetable {
    version: string;
    validFrom: string;
    carrier: {
        id: string;
        name: string;
        contact: {
            email: string;
            website: string;
        };
    };
    stops: Stop[];
    notes: Note[];
    lines: Line[];
}

// Kořenový objekt
export interface TimetableData {
    timetable: Timetable;
}
