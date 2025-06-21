// timetableService.ts

// Importujeme typy (v reálné aplikaci by byly v samostatném souboru)
// Pro tento příklad je necháme zde.
interface Stop { id: number; name: string; lat: number; lon: number }
interface Note { id: number; symbol: string; text: string; }
interface StopEvent { stopId: number; arrival: string | null; departure: string | null; notes?: number[]; }
interface Service { id: number; notes: number[]; schedule: StopEvent[]; }
interface Line { id: string; lineNumber: string; description: string; services: Service[]; }
interface Timetable { version: string; validFrom: string; carrier: any; stops: Stop[]; notes: Note[]; lines: Line[]; }
interface TimetableData { timetable: Timetable; }

type ServiceStopDetail = {
    stopName: string;
    arrivalTime: string;
    departureTime: string;
    isRequestStop: boolean;
    lat: number;
    lon: number;
    lines: string[];
};

/**
 * Třída pro práci s jízdními řády.
 * Pro efektivitu si předvypočítá mapy pro rychlé vyhledávání.
 */
class TimetableService {
    private data: TimetableData;
    private stopIdToName: Map<number, string>;
    private stopNameToId: Map<string, number>;
    private requestStopNoteId?: number; // ID pro poznámku "na znamení"

    constructor(timetableData: TimetableData) {
        this.data = timetableData;
        
        // Vytvoření map pro rychlé vyhledávání názvů a ID zastávek
        this.stopIdToName = new Map(this.data.timetable.stops.map(s => [s.id, s.name]));
        this.stopNameToId = new Map(this.data.timetable.stops.map(s => [s.name, s.id]));
        const requestNote = this.data.timetable.notes.find(
            note => note.text.toLowerCase().includes('na znamení')
        );
        if (requestNote) {
            this.requestStopNoteId = requestNote.id;
        }
    }

    /**
     * A) Vypíše všechny dostupné linky.
     * @returns Pole objektů s číslem a popisem linky.
     */
    public getLines(): { lineNumber: string; description: string }[] {
        return this.data.timetable.lines.map(line => ({
            lineNumber: line.lineNumber,
            description: line.description,
        }));
    }

    /**
     * B) Vypíše všechny spoje pro danou linku.
     * @param lineNumber - Číslo linky (jako string, např. "14").
     * @returns Pole spojů dané linky, nebo undefined, pokud linka neexistuje.
     */
    public getServicesForLine(lineNumber: string): Service[] | undefined {
        const line = this.data.timetable.lines.find(l => l.lineNumber === lineNumber);
        return line?.services;
    }

    /**
     * C) Najde všechny odjezdy z dané zastávky.
     * @param stopName - Název zastávky.
     * @param afterTime - Volitelný parametr, hledá odjezdy po tomto čase (formát "HH:MM").
     * @returns Pole objektů s informacemi o odjezdech, seřazené podle času.
     */
    public findDeparturesFromStop(stopName: string, afterTime: string = "00:00"): { line: string; service: number, departureTime: string; finalStop: string }[] {
        const stopId = this.stopNameToId.get(stopName);
        if (!stopId) {
            console.error(`Zastávka "${stopName}" nebyla nalezena.`);
            return [];
        }

        const departures: { line: string; departureTime: string; finalStop: string, service: number }[] = [];

        this.data.timetable.lines.forEach(line => {
            line.services.forEach(service => {
                service.schedule.forEach(stopEvent => {
                    if (stopEvent.stopId === stopId && stopEvent.departure && stopEvent.departure >= afterTime) {
                        const finalStopId = service.schedule[service.schedule.length - 1].stopId;
                        departures.push({
                            line: line.lineNumber,
                            departureTime: stopEvent.departure,
                            finalStop: this.stopIdToName.get(finalStopId) || 'Neznámá konečná',
                            service: service.id
                        });
                    }
                });
            });
        });

        // Seřazení výsledků podle času odjezdu
        return departures.sort((a, b) => a.departureTime.localeCompare(b.departureTime));
    }

    /**
     * D) Najde přímé spojení mezi dvěma zastávkami.
     * @param fromStopName - Název výchozí zastávky.
     * @param toStopName - Název cílové zastávky.
     * @param afterTime - Volitelný parametr, hledá spoje s odjezdem po tomto čase (formát "HH:MM").
     * @returns Pole objektů s detaily o nalezených přímých spojeních.
     */
    public findConnections(fromStopName: string, toStopName: string, afterTime: string = "00:00"): { line: string; departureTime: string; arrivalTime: string; journey: StopEvent[] }[] {
        const fromStopId = this.stopNameToId.get(fromStopName);
        const toStopId = this.stopNameToId.get(toStopName);

        if (!fromStopId || !toStopId) {
            console.error("Jedna nebo obě zastávky nebyly nalezeny.");
            return [];
        }

        const connections: { line: string; departureTime: string; arrivalTime: string; journey: StopEvent[] }[] = [];

        this.data.timetable.lines.forEach(line => {
            line.services.forEach(service => {
                const fromIndex = service.schedule.findIndex(se => se.stopId === fromStopId);
                const toIndex = service.schedule.findIndex(se => se.stopId === toStopId);

                // Spojení existuje, pokud jsou obě zastávky v jízdním řádu a ve správném pořadí
                if (fromIndex !== -1 && toIndex !== -1 && fromIndex < toIndex) {
                    const fromStopEvent = service.schedule[fromIndex];
                    const toStopEvent = service.schedule[toIndex];

                    if (fromStopEvent.departure && fromStopEvent.departure >= afterTime && toStopEvent.arrival) {
                        connections.push({
                            line: line.lineNumber,
                            departureTime: fromStopEvent.departure,
                            arrivalTime: toStopEvent.arrival,
                            journey: service.schedule.slice(fromIndex, toIndex + 1),
                        });
                    }
                }
            });
        });
        
        // Seřazení výsledků podle času odjezdu
        return connections.sort((a, b) => a.departureTime.localeCompare(b.departureTime));
    }

    /**
     * E) Vrátí detaily o zastávkách pro konkrétní spoj.
     * @param lineNumber - Číslo linky (např. "14").
     * @param serviceId - ID spoje (např. 201).
     * @returns Pole objektů s detaily o každém zastavení spoje, nebo prázdné pole, pokud spoj nebyl nalezen.
     */
    public getServiceDetails(lineNumber: string, serviceId: number): ServiceStopDetail[] {
        const line = this.data.timetable.lines.find(l => l.lineNumber === lineNumber);
        if (!line) {
            console.error(`Linka ${lineNumber} nebyla nalezena.`);
            return [];
        }

        const service = line.services.find(s => s.id === serviceId);
        if (!service) {
            console.error(`Spoj ${serviceId} na lince ${lineNumber} nebyl nalezen.`);
            return [];
        }
        
        // Zpracování jízdního řádu spoje
        const details = service.schedule.map(stopEvent => {
            const stopName = this.stopIdToName.get(stopEvent.stopId) || 'Neznámá zastávka';

            const stopObj = this.data.timetable.stops.find(s => s.id === stopEvent.stopId);
            
            // Zjistíme, zda je zastávka na znamení pro tento konkrétní spoj
            const isRequest = this.requestStopNoteId !== undefined
                ? stopEvent.notes?.includes(this.requestStopNoteId) ?? false
                : false;

            const today = new Date();

            console.log("HEJJJJJJJJJJJJJJJJJJJ", stopEvent);

            // Extrahování roku, měsíce a dne s případným doplněním úvodní nuly
            const year = today.getFullYear(); // Získá rok, např. 2025
            const month = String(today.getMonth() + 1).padStart(2, '0'); // Měsíce jsou číslovány od 0, proto +1
            const day = String(today.getDate()).padStart(2, '0'); // Získá den

            // Sestavení výsledného řetězce pro čas příjezdu ve formátu 'YYYY-MM-DDTHH:mm:ss'
            const formattedArrivalTime = `${year}-${month}-${day}T${stopEvent.arrival}:00`;

            // Stejnou logiku můžete aplikovat i na čas odjezdu, pokud existuje
            const formattedDepartureTime = stopEvent.departure 
                ? `${year}-${month}-${day}T${stopEvent.departure}:00` 
                : "";

            // Vrácení objektu s nově naformátovanými časy
            return {
                stopName: stopName,
                arrivalTime: formattedArrivalTime,
                departureTime: formattedDepartureTime,
                isRequestStop: isRequest,
                lat: stopObj?.lat ?? 99,
                lon: stopObj?.lon ?? 99,
                lines: findLinesByStopName(stopName)
            };
        });

        return details;
    }
}

export function findLinesByStopName(stopName: string): string[] {
    // 1. Najít ID zastávky podle jejího názvu
    const stop = timetableData.timetable.stops.find(s => s.name === stopName);
    
    if (!stop) {
        return []; // Zastávka nebyla nalezena
    }
    
    const stopId = stop.id;

    // 2. Najít všechny linky, které obsahují dané stopId
    const passingLines = new Set<string>(); // Použití Set pro automatické odstranění duplicit

    for (const line of timetableData.timetable.lines) {
        for (const service of line.services) {
            // Použití .some() pro efektivní zjištění, zda zastávka existuje ve spoji
            if (service.schedule.some(scheduleEntry => scheduleEntry.stopId === stopId)) {
                passingLines.add(line.lineNumber);
                break; // Linku jsme našli, můžeme přejít na další
            }
        }
    }
    
    return Array.from(passingLines); // Převedení Setu na pole
}


// --- Příklad použití ---

// Vložení dat jízdního řádu (používáme poslední vygenerovanou verzi)
const timetableData: TimetableData = 
    {
  "timetable": {
    "version": "1.2",
    "validFrom": "2025-06-21",
    "carrier": {
      "id": "SCH-HACK",
      "name": "SteerCodeHack",
      "contact": {
        "email": "dispecink@steercodehack.cz",
        "website": "www.steercodehack.cz"
      }
    },
    "stops": [
      {
        "id": 1,
        "name": "U pracovního stolu",
        "lat": 50.1110209,
        "lon": 14.4396771
      },
      {
        "id": 2,
        "name": "Mezi kancly",
        "lat": 50.1110258,
        "lon": 14.4395624
      },
      {
        "id": 3,
        "name": "Za WC",
        "lat": 50.1109463,
        "lon": 14.4395142
      },
      {
        "id": 4,
        "name": "Na verandě",
        "lat": 50.1110278,
        "lon": 14.4392309
      },
      {
        "id": 5,
        "name": "Pracovna",
        "lat": 50.1110665,
        "lon": 14.4395164
      }
    ],
    "notes": [
      {
        "id": 1,
        "symbol": "x",
        "text": "Zastávka na znamení"
      },
      {
        "id": 2,
        "symbol": "♿",
        "text": "Garantovaný nízkopodlažní spoj"
      },
      {
        "id": 3,
        "symbol": "P",
        "text": "Jede pouze v pátek"
      }
    ],
    "lines": [
      {
        "id": "14-SH",
        "lineNumber": "14",
        "description": "U pr. stolu – Na verandě",
        "services": [
          {
            "id": 101,
            "notes": [2],
            "schedule": [
              {"stopId": 1, "arrival": "05:30", "departure": "05:30"},
              {"stopId": 2, "arrival": "05:32", "departure": "05:32"},
              {"stopId": 3, "arrival": "05:34", "departure": "05:34"},
              {"stopId": 4, "arrival": "05:36", "departure": null}
            ]
          },
          {
            "id": 201,
            "notes": [2],
            "schedule": [
              {"stopId": 4, "arrival": "05:45", "departure": "05:45"},
              {"stopId": 3, "arrival": "05:47", "departure": "05:47", "notes": [1]},
              {"stopId": 2, "arrival": "05:49", "departure": "05:49"},
              {"stopId": 1, "arrival": "05:51", "departure": null}
            ]
          },
          {
            "id": 102,
            "notes": [],
            "schedule": [
              {"stopId": 1, "arrival": "06:00", "departure": "06:00"},
              {"stopId": 2, "arrival": "06:02", "departure": "06:02"},
              {"stopId": 3, "arrival": "06:04", "departure": "06:04"},
              {"stopId": 4, "arrival": "06:06", "departure": null}
            ]
          },
          {
            "id": 202,
            "notes": [],
            "schedule": [
              {"stopId": 4, "arrival": "06:15", "departure": "06:15"},
              {"stopId": 3, "arrival": "06:17", "departure": "06:17", "notes": [1]},
              {"stopId": 2, "arrival": "06:19", "departure": "06:19", "notes": [1]},
              {"stopId": 1, "arrival": "06:21", "departure": null}
            ]
          },
          {
            "id": 108,
            "notes": [2],
            "schedule": [
              {"stopId": 1, "arrival": "14:56", "departure": "14:56"},
              {"stopId": 2, "arrival": "14:58", "departure": "14:58"},
              {"stopId": 3, "arrival": "16:34", "departure": "16:34"},
              {"stopId": 4, "arrival": "16:36", "departure": null}
            ]
          },
          {
            "id": 208,
            "notes": [2],
            "schedule": [
              {"stopId": 4, "arrival": "16:45", "departure": "16:45"},
              {"stopId": 3, "arrival": "16:47", "departure": "16:47"},
              {"stopId": 2, "arrival": "16:49", "departure": "16:49", "notes": [1]},
              {"stopId": 1, "arrival": "16:51", "departure": null}
            ]
          },
          {
            "id": 113,
            "notes": [2],
            "schedule": [
              {"stopId": 1, "arrival": "22:30", "departure": "22:30"},
              {"stopId": 2, "arrival": "22:32", "departure": "22:32", "notes": [1]},
              {"stopId": 3, "arrival": "22:34", "departure": "22:34", "notes": [1]},
              {"stopId": 4, "arrival": "22:36", "departure": null}
            ]
          },
          {
            "id": 213,
            "notes": [2],
            "schedule": [
              {"stopId": 4, "arrival": "23:00", "departure": "23:00"},
              {"stopId": 3, "arrival": "23:02", "departure": "23:02", "notes": [1]},
              {"stopId": 2, "arrival": "23:04", "departure": "23:04", "notes": [1]},
              {"stopId": 1, "arrival": "23:06", "departure": null}
            ]
          }
        ]
      },
      {
        "id": "23-SH",
        "lineNumber": "23",
        "description": "Na verandě - Mezi kancly",
        "services": [
          {
            "id": 301,
            "notes": [2],
            "schedule": [
              {"stopId": 4, "arrival": "08:05", "departure": "08:05"},
              {"stopId": 5, "arrival": "08:07", "departure": "08:07"},
              {"stopId": 2, "arrival": "08:09", "departure": null}
            ]
          },
          {
            "id": 401,
            "notes": [2],
            "schedule": [
              {"stopId": 2, "arrival": "08:15", "departure": "08:15"},
              {"stopId": 5, "arrival": "08:17", "departure": "08:17", "notes": [1]},
              {"stopId": 4, "arrival": "08:19", "departure": null}
            ]
          },
          {
            "id": 303,
            "notes": [],
            "schedule": [
              {"stopId": 4, "arrival": "11:05", "departure": "11:05"},
              {"stopId": 5, "arrival": "11:07", "departure": "11:07", "notes": [1]},
              {"stopId": 2, "arrival": "11:09", "departure": null}
            ]
          },
          {
            "id": 403,
            "notes": [2],
            "schedule": [
              {"stopId": 2, "arrival": "11:15", "departure": "11:15"},
              {"stopId": 5, "arrival": "11:17", "departure": "11:17", "notes": [1]},
              {"stopId": 4, "arrival": "11:19", "departure": null}
            ]
          },
          {
            "id": 305,
            "notes": [3],
            "schedule": [
              {"stopId": 4, "arrival": "16:35", "departure": "16:35"},
              {"stopId": 5, "arrival": "16:37", "departure": "16:37"},
              {"stopId": 2, "arrival": "16:39", "departure": null}
            ]
          },
          {
            "id": 405,
            "notes": [3],
            "schedule": [
              {"stopId": 2, "arrival": "16:45", "departure": "16:45"},
              {"stopId": 5, "arrival": "16:47", "departure": "16:47"},
              {"stopId": 4, "arrival": "16:49", "departure": null}
            ]
          },
          {
            "id": 306,
            "notes": [2],
            "schedule": [
              {"stopId": 4, "arrival": "19:05", "departure": "19:05"},
              {"stopId": 5, "arrival": "19:07", "departure": "19:07", "notes": [1]},
              {"stopId": 2, "arrival": "19:09", "departure": null}
            ]
          },
          {
            "id": 406,
            "notes": [2],
            "schedule": [
              {"stopId": 2, "arrival": "19:15", "departure": "19:15"},
              {"stopId": 5, "arrival": "19:17", "departure": "19:17", "notes": [1]},
              {"stopId": 4, "arrival": "19:19", "departure": null}
            ]
          }
        ]
      }
    ]
  }
}

 ;

// Vytvoření instance služby
const service = new TimetableService(timetableData);

// A) Vypsat linky
console.log("--- VŠECHNY LINKY ---");
console.table(service.getLines());

// B) Vypsat spoje z dané linky
console.log("\n--- SPOJE LINKY 23 ---");
const services23 = service.getServicesForLine("23");
console.log(`Nalezeno ${services23?.length || 0} spojů pro linku 23.`);
// console.log(services23); // Odkomentujte pro zobrazení detailů

// C) Najít odjezdy ze zastávky "Na verandě" po 10:00
console.log("\n--- ODJEZDY ZE ZASTÁVKY 'Na verandě' PO 10:00 ---");
const departures = service.findDeparturesFromStop("Na verandě", "10:00");
console.table(departures);

// D) Najít spojení mezi "U pracovního stolu" a "Na verandě"
console.log("\n--- HLEDÁNÍ SPOJENÍ: U pracovního stolu -> Na verandě ---");
const connections = service.findConnections("U pracovního stolu", "Na verandě");
connections.forEach(conn => {
    console.log(`Linka ${conn.line}: Odjezd ${conn.departureTime} -> Příjezd ${conn.arrivalTime}`);
});


export default service;