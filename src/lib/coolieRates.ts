// Auto-generated master rates and fuzzy resolution engine from 'Coolie SEP 2026.xlsx'
export interface MasterRateItem {
  key: string;
  place: string;
  type: string;
  unit: string;
  rate: number;
  part: string;
  category: string;
}

export const MASTER_PLACES: string[] = [
  "1 NO CONTAINER TO 2 NO CONTAINER",
  "1 NO ROOM TO 2 NO ROOM",
  "10 TON TO 40 TON",
  "10 TON TO DUYVIS",
  "10 TON TO E5",
  "10 TON TO GROUND FLOOR",
  "10 TON TO OLD AC",
  "10 TON TO PRIYA",
  "1ST FLOOR TO GROUND FLOOR",
  "1ST TO GROUND FLOOR",
  "30 TON TO E5",
  "40 TON TO E5",
  "AWASARI GODOWN TO COMPANY",
  "AWASARI GODOWN TO COMPANY BKT",
  "BANGAR GODOWN TO COMPANY",
  "BASEMENT TO E5",
  "BASEMENT TO PRIYA",
  "BASEMNET TO E5",
  "BELT PACKING",
  "BENDE GODOWN TO COMPANY",
  "BHARADI GODOWN TO COMPANY",
  "BLUE RACK TO LOKHANDI RACK",
  "BOILER TO COMPANY",
  "BOUTIQ TO E5",
  "BUILDING TO BUILDING",
  "BUILDING TO GROUND FLOOR",
  "CHAMNER 3 TO CHAMABER",
  "COCOA TO BUTIQUE",
  "COCOA TO DUYVIS",
  "COCOA TO E5",
  "COCOA TO GROUND FLOOR",
  "COCOA TO LINE 3",
  "COCOA TO LINE 4",
  "COCOA TO OLD AC",
  "COCOA TO PRIYA",
  "COCOA TO STORE",
  "COMPANY GODOWN TO COMPANY",
  "COMPANY TO BHARADI GODOWN",
  "COMPANY TO KALE GODOWN",
  "COMPANY TO MANORANJAN GODOWN",
  "COMPANY TO MANORANJAN GODOWN BKT",
  "COMPANY TO PARIHAR GODOWN",
  "COMPANY TO PATEL GODOWN",
  "COMPANY TO PATEL GODOWN BKT",
  "COMPANY TO PRATIK GODOWN",
  "COMPANY TO PRATIK GODOWN BKT",
  "CONTAINER NO 4 TO CONTAINER NO 5",
  "CONTAINER TO COMPANY",
  "CONTAINER TO E5",
  "DUYIS TO E5",
  "DUYIS TO GROUND FLOOR",
  "DUYVIS TO 10 TON",
  "DUYVIS TO COCOA",
  "DUYVIS TO CONTAINER",
  "DUYVIS TO E5",
  "DUYVIS TO GROUND FLOOR",
  "DUYVIS TO LINE 4",
  "DUYVIS TO STORE",
  "E5 BASEMENT TO 10 TON",
  "E5 BASEMENT TO COCOA",
  "E5 BASEMENT TO E5",
  "E5 BASEMENT TO MORDE",
  "E5 BASEMENT TO OLD AC",
  "E5 BASEMENT TO PRIYA",
  "E5 BASEMENT TO SGL",
  "E5 GROUND 10 TON MALA",
  "E5 GROUND FLOOR TO 10 TON",
  "E5 GROUND FLOOR TO COCOA",
  "E5 GROUND FLOOR TO DUYVIS",
  "E5 GROUND FLOOR TO E5",
  "E5 GROUND FLOOR TO LINE 3",
  "E5 GROUND FLOOR TO OLD AC",
  "E5 GROUND FLOOR TO PRIYA",
  "E5 GROUND FLOOR TO SGL",
  "E5 GROUND TO 10 TON",
  "E5 GROUND TO COCOA",
  "E5 GROUND TO DUYVIS",
  "E5 GROUND TO E5",
  "E5 GROUND TO LINE 3",
  "E5 GROUND TO OLD AC",
  "E5 GROUND TO PRIYA",
  "E5 GROUND TO SGL",
  "E5 GROUND TO STORE",
  "E5 TO 10 TON",
  "E5 TO 10 TON MALA",
  "E5 TO 30 TON",
  "E5 TO 40 TON",
  "E5 TO BASEMENT",
  "E5 TO COCOA",
  "E5 TO CONTAINER",
  "E5 TO DUYIS",
  "E5 TO DUYVIS",
  "E5 TO E5 GROUND FLOOR",
  "E5 TO GROUND FLOOR",
  "E5 TO LINE 2",
  "E5 TO LINE 3",
  "E5 TO LINE 4",
  "E5 TO MORDE",
  "E5 TO OLD AC",
  "E5 TO PRIYA",
  "E5 TO REJECTION BASEMENT",
  "E5 TO RND ROOM",
  "E5 TO SGL",
  "E5 TO STORE",
  "ENGINEERIND STORE",
  "ENGINEERING STORE",
  "GATE TO ENGINEERING STORE",
  "GODOWN TO COMPANY",
  "GROUND FLOOR RO DUYVIS",
  "GROUND FLOOR TO 10 TON",
  "GROUND FLOOR TO 10 TON MALA",
  "GROUND FLOOR TO 10 TON MALA BKT",
  "GROUND FLOOR TO 1ST FLOOR",
  "GROUND FLOOR TO BASEMENT",
  "GROUND FLOOR TO BUILDING",
  "GROUND FLOOR TO COMPANY",
  "GROUND FLOOR TO E5",
  "GROUND FLOOR TO ENGINEER STORE",
  "GROUND FLOOR TO ENGINEERING",
  "GROUND FLOOR TO ENGINEERING STORE",
  "GROUND FLOOR TO ENGINEERING STORES",
  "GROUND FLOOR TO FIRST FLOOR",
  "GROUND FLOOR TO PRIYA",
  "GROUND FLOOR TO STORE MALA",
  "GROUND TO 10 TON MALA",
  "GROUND TO DUYVIS",
  "GROUND TO PRIYA",
  "Godown to Company",
  "Godown to Company BKT",
  "HANDILING",
  "HANDLING",
  "IN TANK TO OUT TANK",
  "JEEVAN GODOWN TO COMPANY",
  "KALE GODOWN TO COMPANY",
  "KAULE MALA GODOWN TO COMPANY",
  "KAULE MALA GODOWN TO COMPANY BKT",
  "LABELING",
  "LANDEWADI GODOWN TO COMPANY",
  "LINE 3 TO E5",
  "LINE 3 TO GROUND FLOOR",
  "LINE 4 TO BOUTIQ",
  "LINE 4 TO BUTTING",
  "LINE 4 TO DUYVIS",
  "LINE 4 TO E5",
  "LINE 4 TO GROUND FLOOR",
  "LINE 4 TO STORE",
  "LOADING",
  "LOADING & UNLOADING",
  "LOADING BKT",
  "LOADING FG",
  "LOADING ON RACK",
  "LOADING OR UNLOADING",
  "MANORANJAN GODOWN TO COMPANY",
  "MANORANJAN GODOWN TO COMPANY BKT",
  "NARODI GODOWN TO COMPANY",
  "NEW AWASARI GODOWN TO COMPANY",
  "NEW LANDEWADI GODOWN TO COMPANY",
  "NEW NARODI GODOWN TO COMPANY",
  "OLD AC TO BASEMENT",
  "OLD AC TO E5",
  "OLD AC TO GROUND FLOOR",
  "OLD AC TO LINE 2",
  "OLD AWASARI GODOWN TO COMPANY",
  "OLD AWASARI GODOWN TO COMPANY BKT",
  "OLD NARODI GODOWN TO COMPANY",
  "OLD THORAT GODOWN TO COMPANY",
  "PACKAGING",
  "PARIHAR GODOWN TO COMPANY",
  "PATEL GODOWN TO COMPANY",
  "PATEL GODOWN TO COMPANY BKT",
  "PETH GODOWN TO COMPANY",
  "POURING",
  "PRATIK GODOWN TO COMPANY",
  "PRATIK GODOWN TO COMPANY BKT",
  "PRIYA TO 10 TON",
  "PRIYA TO BASEMENT",
  "PRIYA TO COCOA",
  "PRIYA TO E5",
  "PRIYA TO GROUND FLOOR",
  "RATHOD GODOWN TO COMPANY",
  "REARANGING",
  "REARRANGING",
  "ROOM 1 TO ROOM 2",
  "ROOM NO 1 TO ROOM NO 2",
  "SAMADDIYA GODOWN TO COMPANY",
  "SAMPLING",
  "SGL TO E5",
  "SHELAR GODOWN TO COMPANY",
  "SHELAR GODOWN TO COMPANY BKT",
  "STORE FULL DAY",
  "STORE TO COCOA",
  "STORE TO DUYVIS",
  "STORE TO E5",
  "STORE TO ENGINEERING STORE",
  "STORE TO LINE 4",
  "STORE TO OLD AC",
  "STORE TO PRIYA",
  "STORE TO STORE MALA",
  "SUGAR IN HOPER",
  "SULTANPUR GODOWN TO COMPANY",
  "THORAT GODOWN TO COMPANY",
  "UNLOADING",
  "UNLOADING BKT",
  "UNLOADING FG",
  "WARAI",
  "WARFARE"
];

export const MASTER_TYPES: string[] = [
  "BAG",
  "BARRAL",
  "BARREL",
  "BKT",
  "BOX",
  "BUNDLE",
  "CAN",
  "DAY",
  "Day",
  "Hours",
  "JAR",
  "MEN",
  "MOTOR",
  "NOS",
  "RACK",
  "ROLL",
  "TANKER",
  "TINS",
  "TON"
];

export const MASTER_RATES: MasterRateItem[] = [
  {
    "key": "WARFAREBKT",
    "place": "WARFARE",
    "type": "BKT",
    "unit": "",
    "rate": 0.8,
    "part": "",
    "category": ""
  },
  {
    "key": "WARFAREBAG",
    "place": "WARFARE",
    "type": "BAG",
    "unit": "",
    "rate": 0.8,
    "part": "",
    "category": ""
  },
  {
    "key": "WARFAREBUNDLE",
    "place": "WARFARE",
    "type": "BUNDLE",
    "unit": "",
    "rate": 0.8,
    "part": "",
    "category": ""
  },
  {
    "key": "WARFAREROLL",
    "place": "WARFARE",
    "type": "ROLL",
    "unit": "",
    "rate": 0.8,
    "part": "",
    "category": ""
  },
  {
    "key": "WARFAREBOX",
    "place": "WARFARE",
    "type": "BOX",
    "unit": "",
    "rate": 0.8,
    "part": "",
    "category": ""
  },
  {
    "key": "WARFARERACK",
    "place": "WARFARE",
    "type": "RACK",
    "unit": "",
    "rate": 25,
    "part": "",
    "category": ""
  },
  {
    "key": "WARAIBOX",
    "place": "WARAI",
    "type": "BOX",
    "unit": "",
    "rate": 1,
    "part": "",
    "category": ""
  },
  {
    "key": "WARAIBAG",
    "place": "WARAI",
    "type": "BAG",
    "unit": "",
    "rate": 1,
    "part": "",
    "category": ""
  },
  {
    "key": "WARAI",
    "place": "WARAI",
    "type": "",
    "unit": "",
    "rate": 1,
    "part": "",
    "category": ""
  },
  {
    "key": "UNLOADINGBAG25",
    "place": "UNLOADING",
    "type": "BAG",
    "unit": "25",
    "rate": 1.8,
    "part": "",
    "category": ""
  },
  {
    "key": "UNLOADINGBAG50",
    "place": "UNLOADING",
    "type": "BAG",
    "unit": "50",
    "rate": 3.4,
    "part": "",
    "category": ""
  },
  {
    "key": "UNLOADINGBAG62",
    "place": "UNLOADING",
    "type": "BAG",
    "unit": "62",
    "rate": 3.4,
    "part": "",
    "category": ""
  },
  {
    "key": "UNLOADINGBARREL250",
    "place": "UNLOADING",
    "type": "BARREL",
    "unit": "250",
    "rate": 8,
    "part": "",
    "category": ""
  },
  {
    "key": "UNLOADINGBARREL250",
    "place": "UNLOADING",
    "type": "BARREL",
    "unit": "250",
    "rate": 8,
    "part": "",
    "category": ""
  },
  {
    "key": "UNLOADINGBOX15",
    "place": "UNLOADING",
    "type": "BOX",
    "unit": "15",
    "rate": 1.4,
    "part": "",
    "category": ""
  },
  {
    "key": "UNLOADINGBOX25",
    "place": "UNLOADING",
    "type": "BOX",
    "unit": "25",
    "rate": 1.8,
    "part": "",
    "category": ""
  },
  {
    "key": "UNLOADINGCAN35",
    "place": "UNLOADING",
    "type": "CAN",
    "unit": "35",
    "rate": 1.8,
    "part": "",
    "category": ""
  },
  {
    "key": "UNLOADINGJAR10",
    "place": "UNLOADING",
    "type": "JAR",
    "unit": "10",
    "rate": 1.4,
    "part": "",
    "category": ""
  },
  {
    "key": "UNLOADINGTINS15",
    "place": "UNLOADING",
    "type": "TINS",
    "unit": "15",
    "rate": 1.4,
    "part": "",
    "category": ""
  },
  {
    "key": "UNLOADINGNOS",
    "place": "UNLOADING",
    "type": "NOS",
    "unit": "",
    "rate": 1.4,
    "part": "",
    "category": ""
  },
  {
    "key": "UNLOADINGTANKER",
    "place": "UNLOADING",
    "type": "TANKER",
    "unit": "",
    "rate": 425,
    "part": "",
    "category": ""
  },
  {
    "key": "UNLOADINGBOX",
    "place": "UNLOADING",
    "type": "BOX",
    "unit": "",
    "rate": 1.4,
    "part": "",
    "category": ""
  },
  {
    "key": "UNLOADINGROLL",
    "place": "UNLOADING",
    "type": "ROLL",
    "unit": "",
    "rate": 1.2,
    "part": "",
    "category": ""
  },
  {
    "key": "UNLOADINGJAR",
    "place": "UNLOADING",
    "type": "JAR",
    "unit": "",
    "rate": 1.4,
    "part": "",
    "category": ""
  },
  {
    "key": "UNLOADINGBAG20",
    "place": "UNLOADING",
    "type": "BAG",
    "unit": "20",
    "rate": 1.4,
    "part": "",
    "category": ""
  },
  {
    "key": "UNLOADINGBAG35",
    "place": "UNLOADING",
    "type": "BAG",
    "unit": "35",
    "rate": 1.8,
    "part": "",
    "category": "RM"
  },
  {
    "key": "UNLOADINGCAN25",
    "place": "UNLOADING",
    "type": "CAN",
    "unit": "25",
    "rate": 1.8,
    "part": "",
    "category": "RM"
  },
  {
    "key": "UNLOADINGBAG",
    "place": "UNLOADING",
    "type": "BAG",
    "unit": "",
    "rate": 1.4,
    "part": "POUCH",
    "category": "PM"
  },
  {
    "key": "UNLOADINGTINS25",
    "place": "UNLOADING",
    "type": "TINS",
    "unit": "25",
    "rate": 1.8,
    "part": "",
    "category": "RM"
  },
  {
    "key": "UNLOADINGBAG60",
    "place": "UNLOADING",
    "type": "BAG",
    "unit": "60",
    "rate": 3.4,
    "part": "",
    "category": ""
  },
  {
    "key": "UNLOADINGBKT",
    "place": "UNLOADING",
    "type": "BKT",
    "unit": "",
    "rate": 1.4,
    "part": "",
    "category": ""
  },
  {
    "key": "UNLOADINGBAG",
    "place": "UNLOADING",
    "type": "BAG",
    "unit": "",
    "rate": 1.4,
    "part": "",
    "category": ""
  },
  {
    "key": "UNLOADINGBUNDLE",
    "place": "UNLOADING",
    "type": "BUNDLE",
    "unit": "",
    "rate": 1.4,
    "part": "JAR",
    "category": "PM"
  },
  {
    "key": "UNLOADINGCAN20",
    "place": "UNLOADING",
    "type": "CAN",
    "unit": "20",
    "rate": 1.4,
    "part": "",
    "category": "RM"
  },
  {
    "key": "UNLOADINGROLL30",
    "place": "UNLOADING",
    "type": "ROLL",
    "unit": "30",
    "rate": 1.8,
    "part": "",
    "category": ""
  },
  {
    "key": "UNLOADINGRACK",
    "place": "UNLOADING",
    "type": "RACK",
    "unit": "",
    "rate": 50,
    "part": "",
    "category": ""
  },
  {
    "key": "UNLOADINGBUNDLE",
    "place": "UNLOADING",
    "type": "BUNDLE",
    "unit": "",
    "rate": 1.4,
    "part": "PUTHA",
    "category": "PM"
  },
  {
    "key": "UNLOADINGBUNDLE",
    "place": "UNLOADING",
    "type": "BUNDLE",
    "unit": "",
    "rate": 1.4,
    "part": "JAKAN",
    "category": "PM"
  },
  {
    "key": "UNLOADINGBUNDLE",
    "place": "UNLOADING",
    "type": "BUNDLE",
    "unit": "",
    "rate": 1.4,
    "part": "POLYBAG",
    "category": "PM"
  },
  {
    "key": "UNLOADINGBUNDLE",
    "place": "UNLOADING",
    "type": "BUNDLE",
    "unit": "",
    "rate": 1.4,
    "part": "PAPER",
    "category": "PM"
  },
  {
    "key": "UNLOADINGBUNDLE",
    "place": "UNLOADING",
    "type": "BUNDLE",
    "unit": "",
    "rate": 5,
    "part": "BKT",
    "category": "PM"
  },
  {
    "key": "UNLOADINGNOS",
    "place": "UNLOADING",
    "type": "NOS",
    "unit": "",
    "rate": 30,
    "part": "GAS",
    "category": "ENGINEERING"
  },
  {
    "key": "THORAT GODOWN TO COMPANYBAG25",
    "place": "THORAT GODOWN TO COMPANY",
    "type": "BAG",
    "unit": "25",
    "rate": 3.6,
    "part": "",
    "category": ""
  },
  {
    "key": "SULTANPUR GODOWN TO COMPANYBAG62",
    "place": "SULTANPUR GODOWN TO COMPANY",
    "type": "BAG",
    "unit": "62",
    "rate": 6.8,
    "part": "",
    "category": ""
  },
  {
    "key": "SULTANPUR GODOWN TO COMPANYBAG62",
    "place": "SULTANPUR GODOWN TO COMPANY",
    "type": "BAG",
    "unit": "62",
    "rate": 6.8,
    "part": "",
    "category": ""
  },
  {
    "key": "SUGAR IN HOPERBAG50",
    "place": "SUGAR IN HOPER",
    "type": "BAG",
    "unit": "50",
    "rate": 4.5,
    "part": "",
    "category": ""
  },
  {
    "key": "STORE TO STORE MALABUNDLE",
    "place": "STORE TO STORE MALA",
    "type": "BUNDLE",
    "unit": "",
    "rate": 1.5,
    "part": "",
    "category": ""
  },
  {
    "key": "STORE TO STORE MALATINS25",
    "place": "STORE TO STORE MALA",
    "type": "TINS",
    "unit": "25",
    "rate": 1.5,
    "part": "",
    "category": ""
  },
  {
    "key": "STORE TO STORE MALACAN20",
    "place": "STORE TO STORE MALA",
    "type": "CAN",
    "unit": "20",
    "rate": 1.5,
    "part": "",
    "category": ""
  },
  {
    "key": "STORE TO PRIYARACK",
    "place": "STORE TO PRIYA",
    "type": "RACK",
    "unit": "",
    "rate": 50,
    "part": "",
    "category": ""
  },
  {
    "key": "STORE TO PRIYARACK",
    "place": "STORE TO PRIYA",
    "type": "RACK",
    "unit": "",
    "rate": 50,
    "part": "",
    "category": ""
  },
  {
    "key": "STORE TO LINE 4RACK",
    "place": "STORE TO LINE 4",
    "type": "RACK",
    "unit": "",
    "rate": 50,
    "part": "",
    "category": ""
  },
  {
    "key": "STORE TO E5RACK",
    "place": "STORE TO E5",
    "type": "RACK",
    "unit": "",
    "rate": 50,
    "part": "",
    "category": ""
  },
  {
    "key": "STORE TO DUYVISRACK",
    "place": "STORE TO DUYVIS",
    "type": "RACK",
    "unit": "",
    "rate": 50,
    "part": "",
    "category": ""
  },
  {
    "key": "STORE TO COCOARACK",
    "place": "STORE TO COCOA",
    "type": "RACK",
    "unit": "",
    "rate": 50,
    "part": "",
    "category": ""
  },
  {
    "key": "STORE TO COCOARACK",
    "place": "STORE TO COCOA",
    "type": "RACK",
    "unit": "",
    "rate": 50,
    "part": "",
    "category": ""
  },
  {
    "key": "SHELAR GODOWN TO COMPANYBOX",
    "place": "SHELAR GODOWN TO COMPANY",
    "type": "BOX",
    "unit": "",
    "rate": 2.8,
    "part": "",
    "category": ""
  },
  {
    "key": "SHELAR GODOWN TO COMPANYBUNDLE",
    "place": "SHELAR GODOWN TO COMPANY",
    "type": "BUNDLE",
    "unit": "",
    "rate": 2.8,
    "part": "",
    "category": ""
  },
  {
    "key": "SAMPLINGBAG62",
    "place": "SAMPLING",
    "type": "BAG",
    "unit": "62",
    "rate": 3.4,
    "part": "",
    "category": ""
  },
  {
    "key": "SAMADDIYA GODOWN TO COMPANYBAG25",
    "place": "SAMADDIYA GODOWN TO COMPANY",
    "type": "BAG",
    "unit": "25",
    "rate": 3.6,
    "part": "",
    "category": ""
  },
  {
    "key": "ROOM 1 TO ROOM 2RACK",
    "place": "ROOM 1 TO ROOM 2",
    "type": "RACK",
    "unit": "",
    "rate": 25,
    "part": "",
    "category": ""
  },
  {
    "key": "REARANGINGBUNDLE",
    "place": "REARANGING",
    "type": "BUNDLE",
    "unit": "",
    "rate": 0.5,
    "part": "",
    "category": ""
  },
  {
    "key": "REARANGINGBOX",
    "place": "REARANGING",
    "type": "BOX",
    "unit": "",
    "rate": 0.5,
    "part": "",
    "category": ""
  },
  {
    "key": "REARANGINGBAG",
    "place": "REARANGING",
    "type": "BAG",
    "unit": "",
    "rate": 0.5,
    "part": "",
    "category": ""
  },
  {
    "key": "REARANGINGROLL",
    "place": "REARANGING",
    "type": "ROLL",
    "unit": "",
    "rate": 0.5,
    "part": "",
    "category": ""
  },
  {
    "key": "REARANGINGBKT",
    "place": "REARANGING",
    "type": "BKT",
    "unit": "",
    "rate": 0.5,
    "part": "",
    "category": ""
  },
  {
    "key": "REARANGINGRACK",
    "place": "REARANGING",
    "type": "RACK",
    "unit": "",
    "rate": 3,
    "part": "MT RACK",
    "category": ""
  },
  {
    "key": "REARANGINGBKT",
    "place": "REARANGING",
    "type": "BKT",
    "unit": "",
    "rate": 0.5,
    "part": "",
    "category": ""
  },
  {
    "key": "RATHOD GODOWN TO COMPANYBAG25",
    "place": "RATHOD GODOWN TO COMPANY",
    "type": "BAG",
    "unit": "25",
    "rate": 3.6,
    "part": "",
    "category": ""
  },
  {
    "key": "PRIYA TO GROUND FLOORRACK",
    "place": "PRIYA TO GROUND FLOOR",
    "type": "RACK",
    "unit": "",
    "rate": 25,
    "part": "",
    "category": ""
  },
  {
    "key": "PRIYA TO E5RACK",
    "place": "PRIYA TO E5",
    "type": "RACK",
    "unit": "",
    "rate": 25,
    "part": "",
    "category": ""
  },
  {
    "key": "PRATIK GODOWN TO COMPANYBOX",
    "place": "PRATIK GODOWN TO COMPANY",
    "type": "BOX",
    "unit": "",
    "rate": 2.8,
    "part": "",
    "category": ""
  },
  {
    "key": "PRATIK GODOWN TO COMPANYBUNDLE",
    "place": "PRATIK GODOWN TO COMPANY",
    "type": "BUNDLE",
    "unit": "",
    "rate": 2.8,
    "part": "",
    "category": ""
  },
  {
    "key": "PRATIK GODOWN TO COMPANYBUNDLE",
    "place": "PRATIK GODOWN TO COMPANY",
    "type": "BUNDLE",
    "unit": "",
    "rate": 10,
    "part": "BKT",
    "category": ""
  },
  {
    "key": "POURINGBARRAL250",
    "place": "POURING",
    "type": "BARRAL",
    "unit": "250",
    "rate": 5,
    "part": "",
    "category": ""
  },
  {
    "key": "POURINGBARRAL250",
    "place": "POURING",
    "type": "BARRAL",
    "unit": "250",
    "rate": 5,
    "part": "",
    "category": ""
  },
  {
    "key": "PATEL GODOWN TO COMPANYBOX",
    "place": "PATEL GODOWN TO COMPANY",
    "type": "BOX",
    "unit": "",
    "rate": 2.8,
    "part": "BOX",
    "category": ""
  },
  {
    "key": "PATEL GODOWN TO COMPANYBUNDLE",
    "place": "PATEL GODOWN TO COMPANY",
    "type": "BUNDLE",
    "unit": "",
    "rate": 2.8,
    "part": "JAKAN",
    "category": ""
  },
  {
    "key": "PATEL GODOWN TO COMPANYBUNDLE",
    "place": "PATEL GODOWN TO COMPANY",
    "type": "BUNDLE",
    "unit": "",
    "rate": 2.8,
    "part": "PUTHA",
    "category": ""
  },
  {
    "key": "PATEL GODOWN TO COMPANYBUNDLE",
    "place": "PATEL GODOWN TO COMPANY",
    "type": "BUNDLE",
    "unit": "",
    "rate": 2.8,
    "part": "POLYBAG",
    "category": ""
  },
  {
    "key": "PATEL GODOWN TO COMPANYROLL",
    "place": "PATEL GODOWN TO COMPANY",
    "type": "ROLL",
    "unit": "",
    "rate": 2.8,
    "part": "ROLL",
    "category": ""
  },
  {
    "key": "PATEL GODOWN TO COMPANYBAG",
    "place": "PATEL GODOWN TO COMPANY",
    "type": "BAG",
    "unit": "",
    "rate": 2.8,
    "part": "BAG",
    "category": ""
  },
  {
    "key": "PATEL GODOWN TO COMPANYBUNDLE",
    "place": "PATEL GODOWN TO COMPANY",
    "type": "BUNDLE",
    "unit": "",
    "rate": 10,
    "part": "BKT",
    "category": "PM"
  },
  {
    "key": "PARIHAR GODOWN TO COMPANYRACK",
    "place": "PARIHAR GODOWN TO COMPANY",
    "type": "RACK",
    "unit": "",
    "rate": 100,
    "part": "",
    "category": ""
  },
  {
    "key": "PARIHAR GODOWN TO COMPANYJAR20",
    "place": "PARIHAR GODOWN TO COMPANY",
    "type": "JAR",
    "unit": "20",
    "rate": 2.8,
    "part": "",
    "category": "RM"
  },
  {
    "key": "PARIHAR GODOWN TO COMPANYTINS",
    "place": "PARIHAR GODOWN TO COMPANY",
    "type": "TINS",
    "unit": "",
    "rate": 2.8,
    "part": "",
    "category": ""
  },
  {
    "key": "PARIHAR GODOWN TO COMPANYBOX25FG",
    "place": "PARIHAR GODOWN TO COMPANY",
    "type": "BOX",
    "unit": "25",
    "rate": 3.4,
    "part": "",
    "category": "FG"
  },
  {
    "key": "PARIHAR GODOWN TO COMPANYBOX25RM",
    "place": "PARIHAR GODOWN TO COMPANY",
    "type": "BOX",
    "unit": "25",
    "rate": 3.6,
    "part": "",
    "category": "RM"
  },
  {
    "key": "OLD THORAT GODOWN TO COMPANYBAG25",
    "place": "OLD THORAT GODOWN TO COMPANY",
    "type": "BAG",
    "unit": "25",
    "rate": 3.6,
    "part": "",
    "category": ""
  },
  {
    "key": "OLD NARODI GODOWN TO COMPANYBAG25",
    "place": "OLD NARODI GODOWN TO COMPANY",
    "type": "BAG",
    "unit": "25",
    "rate": 3.6,
    "part": "",
    "category": ""
  },
  {
    "key": "OLD AC TO GROUND FLOORRACK",
    "place": "OLD AC TO GROUND FLOOR",
    "type": "RACK",
    "unit": "",
    "rate": 25,
    "part": "",
    "category": ""
  },
  {
    "key": "OLD AC TO E5RACK",
    "place": "OLD AC TO E5",
    "type": "RACK",
    "unit": "",
    "rate": 50,
    "part": "",
    "category": ""
  },
  {
    "key": "OLD AC TO E5RACK",
    "place": "OLD AC TO E5",
    "type": "RACK",
    "unit": "",
    "rate": 50,
    "part": "",
    "category": ""
  },
  {
    "key": "NEW NARODI GODOWN TO COMPANYBAG25",
    "place": "NEW NARODI GODOWN TO COMPANY",
    "type": "BAG",
    "unit": "25",
    "rate": 3.6,
    "part": "",
    "category": ""
  },
  {
    "key": "NEW AWASARI GODOWN TO COMPANYBARRAL250",
    "place": "NEW AWASARI GODOWN TO COMPANY",
    "type": "BARRAL",
    "unit": "250",
    "rate": 16,
    "part": "",
    "category": ""
  },
  {
    "key": "NARODI GODOWN TO COMPANYBAG25",
    "place": "NARODI GODOWN TO COMPANY",
    "type": "BAG",
    "unit": "25",
    "rate": 3.6,
    "part": "",
    "category": ""
  },
  {
    "key": "MANORANJAN GODOWN TO COMPANYBOX",
    "place": "MANORANJAN GODOWN TO COMPANY",
    "type": "BOX",
    "unit": "",
    "rate": 2.8,
    "part": "",
    "category": ""
  },
  {
    "key": "MANORANJAN GODOWN TO COMPANYBUNDLE",
    "place": "MANORANJAN GODOWN TO COMPANY",
    "type": "BUNDLE",
    "unit": "",
    "rate": 2.8,
    "part": "",
    "category": ""
  },
  {
    "key": "MANORANJAN GODOWN TO COMPANYBUNDLE",
    "place": "MANORANJAN GODOWN TO COMPANY",
    "type": "BUNDLE",
    "unit": "",
    "rate": 10,
    "part": "BKT",
    "category": "PM"
  },
  {
    "key": "LOADING ON RACKBKT",
    "place": "LOADING ON RACK",
    "type": "BKT",
    "unit": "",
    "rate": 0.5,
    "part": "",
    "category": ""
  },
  {
    "key": "LOADING ON RACKBAG",
    "place": "LOADING ON RACK",
    "type": "BAG",
    "unit": "",
    "rate": 0.5,
    "part": "",
    "category": ""
  },
  {
    "key": "LOADING ON RACKBKT",
    "place": "LOADING ON RACK",
    "type": "BKT",
    "unit": "",
    "rate": 0.5,
    "part": "",
    "category": ""
  },
  {
    "key": "LOADING ON RACKBAG25",
    "place": "LOADING ON RACK",
    "type": "BAG",
    "unit": "25",
    "rate": 0.5,
    "part": "",
    "category": ""
  },
  {
    "key": "LOADING ON RACKBOX",
    "place": "LOADING ON RACK",
    "type": "BOX",
    "unit": "",
    "rate": 0.5,
    "part": "",
    "category": ""
  },
  {
    "key": "LOADINGBAG25",
    "place": "LOADING",
    "type": "BAG",
    "unit": "25",
    "rate": 1.8,
    "part": "",
    "category": "RM"
  },
  {
    "key": "LOADINGBAG20",
    "place": "LOADING",
    "type": "BAG",
    "unit": "20",
    "rate": 1.4,
    "part": "",
    "category": ""
  },
  {
    "key": "LOADINGNOS",
    "place": "LOADING",
    "type": "NOS",
    "unit": "",
    "rate": 1.4,
    "part": "",
    "category": ""
  },
  {
    "key": "LOADINGCAN",
    "place": "LOADING",
    "type": "CAN",
    "unit": "",
    "rate": 1.4,
    "part": "",
    "category": ""
  },
  {
    "key": "LOADINGBKT",
    "place": "LOADING",
    "type": "BKT",
    "unit": "",
    "rate": 1.4,
    "part": "",
    "category": ""
  },
  {
    "key": "LOADINGRACK",
    "place": "LOADING",
    "type": "RACK",
    "unit": "",
    "rate": 50,
    "part": "",
    "category": ""
  },
  {
    "key": "LOADINGBOX",
    "place": "LOADING",
    "type": "BOX",
    "unit": "",
    "rate": 1.4,
    "part": "",
    "category": ""
  },
  {
    "key": "LOADINGBOX20",
    "place": "LOADING",
    "type": "BOX",
    "unit": "20",
    "rate": 1.4,
    "part": "",
    "category": ""
  },
  {
    "key": "LOADINGBOX25",
    "place": "LOADING",
    "type": "BOX",
    "unit": "25",
    "rate": 1.8,
    "part": "",
    "category": ""
  },
  {
    "key": "LOADINGBAG50",
    "place": "LOADING",
    "type": "BAG",
    "unit": "50",
    "rate": 3.4,
    "part": "",
    "category": ""
  },
  {
    "key": "LOADINGBUNDLE",
    "place": "LOADING",
    "type": "BUNDLE",
    "unit": "",
    "rate": 5,
    "part": "BKT",
    "category": ""
  },
  {
    "key": "LOADINGBUNDLE",
    "place": "LOADING",
    "type": "BUNDLE",
    "unit": "",
    "rate": 1.4,
    "part": "JAKAN",
    "category": ""
  },
  {
    "key": "LOADINGNOS",
    "place": "LOADING",
    "type": "NOS",
    "unit": "",
    "rate": 30,
    "part": "GAS",
    "category": "ENGINEERING"
  },
  {
    "key": "LINE 4 TO STORERACK",
    "place": "LINE 4 TO STORE",
    "type": "RACK",
    "unit": "",
    "rate": 50,
    "part": "",
    "category": ""
  },
  {
    "key": "LINE 4 TO E5RACK",
    "place": "LINE 4 TO E5",
    "type": "RACK",
    "unit": "",
    "rate": 50,
    "part": "",
    "category": ""
  },
  {
    "key": "LINE 4 TO BOUTIQRACK",
    "place": "LINE 4 TO BOUTIQ",
    "type": "RACK",
    "unit": "",
    "rate": 50,
    "part": "",
    "category": ""
  },
  {
    "key": "LINE 3 TO GROUND FLOORRACK",
    "place": "LINE 3 TO GROUND FLOOR",
    "type": "RACK",
    "unit": "",
    "rate": 25,
    "part": "",
    "category": ""
  },
  {
    "key": "LINE 3 TO E5RACK",
    "place": "LINE 3 TO E5",
    "type": "RACK",
    "unit": "",
    "rate": 50,
    "part": "",
    "category": ""
  },
  {
    "key": "LANDEWADI GODOWN TO COMPANYBAG62",
    "place": "LANDEWADI GODOWN TO COMPANY",
    "type": "BAG",
    "unit": "62",
    "rate": 6.8,
    "part": "",
    "category": ""
  },
  {
    "key": "LABELINGBOX15",
    "place": "LABELING",
    "type": "BOX",
    "unit": "15",
    "rate": 3,
    "part": "",
    "category": ""
  },
  {
    "key": "LABELINGBOX25",
    "place": "LABELING",
    "type": "BOX",
    "unit": "25",
    "rate": 3,
    "part": "",
    "category": ""
  },
  {
    "key": "KAULE MALA GODOWN TO COMPANYBUNDLE",
    "place": "KAULE MALA GODOWN TO COMPANY",
    "type": "BUNDLE",
    "unit": "",
    "rate": 2.8,
    "part": "",
    "category": ""
  },
  {
    "key": "KAULE MALA GODOWN TO COMPANYBOX",
    "place": "KAULE MALA GODOWN TO COMPANY",
    "type": "BOX",
    "unit": "",
    "rate": 2.8,
    "part": "",
    "category": ""
  },
  {
    "key": "KALE GODOWN TO COMPANYBAG25",
    "place": "KALE GODOWN TO COMPANY",
    "type": "BAG",
    "unit": "25",
    "rate": 3.6,
    "part": "",
    "category": ""
  },
  {
    "key": "JEEVAN GODOWN TO COMPANYBAG25",
    "place": "JEEVAN GODOWN TO COMPANY",
    "type": "BAG",
    "unit": "25",
    "rate": 3.6,
    "part": "",
    "category": ""
  },
  {
    "key": "JEEVAN GODOWN TO COMPANYBOX",
    "place": "JEEVAN GODOWN TO COMPANY",
    "type": "BOX",
    "unit": "",
    "rate": 2.8,
    "part": "",
    "category": ""
  },
  {
    "key": "JEEVAN GODOWN TO COMPANYBAG",
    "place": "JEEVAN GODOWN TO COMPANY",
    "type": "BAG",
    "unit": "",
    "rate": 2.8,
    "part": "",
    "category": ""
  },
  {
    "key": "JEEVAN GODOWN TO COMPANYBAG20",
    "place": "JEEVAN GODOWN TO COMPANY",
    "type": "BAG",
    "unit": "20",
    "rate": 2.8,
    "part": "",
    "category": ""
  },
  {
    "key": "JEEVAN GODOWN TO COMPANYBOX25",
    "place": "JEEVAN GODOWN TO COMPANY",
    "type": "BOX",
    "unit": "25",
    "rate": 3.6,
    "part": "",
    "category": ""
  },
  {
    "key": "JEEVAN GODOWN TO COMPANYBOX20",
    "place": "JEEVAN GODOWN TO COMPANY",
    "type": "BOX",
    "unit": "20",
    "rate": 2.8,
    "part": "",
    "category": ""
  },
  {
    "key": "JEEVAN GODOWN TO COMPANYBOX20",
    "place": "JEEVAN GODOWN TO COMPANY",
    "type": "BOX",
    "unit": "20",
    "rate": 2.8,
    "part": "",
    "category": ""
  },
  {
    "key": "JEEVAN GODOWN TO COMPANYBOX15",
    "place": "JEEVAN GODOWN TO COMPANY",
    "type": "BOX",
    "unit": "15",
    "rate": 2.8,
    "part": "",
    "category": ""
  },
  {
    "key": "HANDILINGRACK",
    "place": "HANDILING",
    "type": "RACK",
    "unit": "",
    "rate": 3,
    "part": "",
    "category": ""
  },
  {
    "key": "GROUND TO PRIYARACK",
    "place": "GROUND TO PRIYA",
    "type": "RACK",
    "unit": "",
    "rate": 25,
    "part": "",
    "category": ""
  },
  {
    "key": "GROUND TO DUYVISRACK",
    "place": "GROUND TO DUYVIS",
    "type": "RACK",
    "unit": "",
    "rate": 25,
    "part": "",
    "category": ""
  },
  {
    "key": "GROUND TO 10 TON MALARACK",
    "place": "GROUND TO 10 TON MALA",
    "type": "RACK",
    "unit": "",
    "rate": 25,
    "part": "",
    "category": ""
  },
  {
    "key": "GROUND FLOOR TO STORE MALABAG20",
    "place": "GROUND FLOOR TO STORE MALA",
    "type": "BAG",
    "unit": "20",
    "rate": 1.5,
    "part": "",
    "category": "RM"
  },
  {
    "key": "GROUND FLOOR TO STORE MALABOX",
    "place": "GROUND FLOOR TO STORE MALA",
    "type": "BOX",
    "unit": "",
    "rate": 1.5,
    "part": "",
    "category": "RM"
  },
  {
    "key": "GROUND FLOOR TO STORE MALABOX",
    "place": "GROUND FLOOR TO STORE MALA",
    "type": "BOX",
    "unit": "",
    "rate": 1.5,
    "part": "",
    "category": ""
  },
  {
    "key": "GROUND FLOOR TO PRIYARACK",
    "place": "GROUND FLOOR TO PRIYA",
    "type": "RACK",
    "unit": "",
    "rate": 25,
    "part": "",
    "category": ""
  },
  {
    "key": "GROUND FLOOR TO ENGINEERING STORENOS",
    "place": "GROUND FLOOR TO ENGINEERING STORE",
    "type": "NOS",
    "unit": "",
    "rate": 1.5,
    "part": "",
    "category": ""
  },
  {
    "key": "GROUND FLOOR TO ENGINEERINGNOS",
    "place": "GROUND FLOOR TO ENGINEERING",
    "type": "NOS",
    "unit": "",
    "rate": 1.5,
    "part": "",
    "category": ""
  },
  {
    "key": "GROUND FLOOR TO ENGINEER STOREBUNDLE",
    "place": "GROUND FLOOR TO ENGINEER STORE",
    "type": "BUNDLE",
    "unit": "",
    "rate": 1.5,
    "part": "",
    "category": ""
  },
  {
    "key": "GROUND FLOOR TO ENGINEER STORENOS",
    "place": "GROUND FLOOR TO ENGINEER STORE",
    "type": "NOS",
    "unit": "",
    "rate": 1.5,
    "part": "",
    "category": ""
  },
  {
    "key": "GROUND FLOOR TO E5RACK",
    "place": "GROUND FLOOR TO E5",
    "type": "RACK",
    "unit": "",
    "rate": 25,
    "part": "",
    "category": ""
  },
  {
    "key": "GROUND FLOOR TO COMPANYBUNDLE",
    "place": "GROUND FLOOR TO COMPANY",
    "type": "BUNDLE",
    "unit": "",
    "rate": 1.5,
    "part": "",
    "category": ""
  },
  {
    "key": "GROUND FLOOR TO 10 TONBUNDLE",
    "place": "GROUND FLOOR TO 10 TON",
    "type": "BUNDLE",
    "unit": "",
    "rate": 1.5,
    "part": "",
    "category": ""
  },
  {
    "key": "GROUND FLOOR TO 10 TONBOX",
    "place": "GROUND FLOOR TO 10 TON",
    "type": "BOX",
    "unit": "",
    "rate": 1.5,
    "part": "",
    "category": ""
  },
  {
    "key": "GROUND FLOOR TO 10 TONRACK",
    "place": "GROUND FLOOR TO 10 TON",
    "type": "RACK",
    "unit": "",
    "rate": 25,
    "part": "",
    "category": ""
  },
  {
    "key": "GROUND FLOOR RO DUYVISRACK",
    "place": "GROUND FLOOR RO DUYVIS",
    "type": "RACK",
    "unit": "",
    "rate": 25,
    "part": "",
    "category": ""
  },
  {
    "key": "ENGINEERING STOREDAY",
    "place": "ENGINEERING STORE",
    "type": "DAY",
    "unit": "",
    "rate": 400,
    "part": "FULL DAY",
    "category": ""
  },
  {
    "key": "ENGINEERING STOREDAY",
    "place": "ENGINEERING STORE",
    "type": "DAY",
    "unit": "",
    "rate": 200,
    "part": "HALF DAY",
    "category": ""
  },
  {
    "key": "E5 TO STORERACK",
    "place": "E5 TO STORE",
    "type": "RACK",
    "unit": "",
    "rate": 50,
    "part": "",
    "category": ""
  },
  {
    "key": "E5 TO REJECTION BASEMENTRACK",
    "place": "E5 TO REJECTION BASEMENT",
    "type": "RACK",
    "unit": "",
    "rate": 25,
    "part": "",
    "category": ""
  },
  {
    "key": "E5 TO PRIYARACK",
    "place": "E5 TO PRIYA",
    "type": "RACK",
    "unit": "",
    "rate": 25,
    "part": "",
    "category": ""
  },
  {
    "key": "E5 TO OLD ACRACK",
    "place": "E5 TO OLD AC",
    "type": "RACK",
    "unit": "",
    "rate": 50,
    "part": "",
    "category": ""
  },
  {
    "key": "E5 TO MORDERACK",
    "place": "E5 TO MORDE",
    "type": "RACK",
    "unit": "",
    "rate": 50,
    "part": "",
    "category": ""
  },
  {
    "key": "E5 TO MORDEBUNDLE",
    "place": "E5 TO MORDE",
    "type": "BUNDLE",
    "unit": "",
    "rate": 1.5,
    "part": "",
    "category": ""
  },
  {
    "key": "E5 TO LINE 4RACK",
    "place": "E5 TO LINE 4",
    "type": "RACK",
    "unit": "",
    "rate": 50,
    "part": "",
    "category": ""
  },
  {
    "key": "E5 TO LINE 3RACK",
    "place": "E5 TO LINE 3",
    "type": "RACK",
    "unit": "",
    "rate": 50,
    "part": "",
    "category": ""
  },
  {
    "key": "E5 TO LINE 3BOX",
    "place": "E5 TO LINE 3",
    "type": "BOX",
    "unit": "",
    "rate": 1.5,
    "part": "",
    "category": ""
  },
  {
    "key": "E5 TO GROUND FLOORRACK",
    "place": "E5 TO GROUND FLOOR",
    "type": "RACK",
    "unit": "",
    "rate": 25,
    "part": "",
    "category": ""
  },
  {
    "key": "E5 TO SGLRACK",
    "place": "E5 TO SGL",
    "type": "RACK",
    "unit": "",
    "rate": 50,
    "part": "",
    "category": ""
  },
  {
    "key": "E5 TO E5 GROUND FLOORRACK",
    "place": "E5 TO E5 GROUND FLOOR",
    "type": "RACK",
    "unit": "",
    "rate": 25,
    "part": "",
    "category": ""
  },
  {
    "key": "E5 TO DUYVISRACK",
    "place": "E5 TO DUYVIS",
    "type": "RACK",
    "unit": "",
    "rate": 50,
    "part": "",
    "category": ""
  },
  {
    "key": "E5 TO CONTAINERRACK",
    "place": "E5 TO CONTAINER",
    "type": "RACK",
    "unit": "",
    "rate": 50,
    "part": "",
    "category": ""
  },
  {
    "key": "E5 TO COCOARACK",
    "place": "E5 TO COCOA",
    "type": "RACK",
    "unit": "",
    "rate": 50,
    "part": "",
    "category": ""
  },
  {
    "key": "E5 TO BASEMENTRACK",
    "place": "E5 TO BASEMENT",
    "type": "RACK",
    "unit": "",
    "rate": 25,
    "part": "",
    "category": ""
  },
  {
    "key": "E5 TO 40 TONRACK",
    "place": "E5 TO 40 TON",
    "type": "RACK",
    "unit": "",
    "rate": 50,
    "part": "",
    "category": ""
  },
  {
    "key": "E5 TO 10 TON MALARACK",
    "place": "E5 TO 10 TON MALA",
    "type": "RACK",
    "unit": "",
    "rate": 50,
    "part": "",
    "category": ""
  },
  {
    "key": "E5 TO 10 TONRACK",
    "place": "E5 TO 10 TON",
    "type": "RACK",
    "unit": "",
    "rate": 50,
    "part": "",
    "category": ""
  },
  {
    "key": "E5 GROUND TO STORERACK",
    "place": "E5 GROUND TO STORE",
    "type": "RACK",
    "unit": "",
    "rate": 25,
    "part": "",
    "category": ""
  },
  {
    "key": "E5 GROUND TO SGLRACK",
    "place": "E5 GROUND TO SGL",
    "type": "RACK",
    "unit": "",
    "rate": 25,
    "part": "",
    "category": ""
  },
  {
    "key": "E5 GROUND TO OLD ACRACK",
    "place": "E5 GROUND TO OLD AC",
    "type": "RACK",
    "unit": "",
    "rate": 25,
    "part": "",
    "category": ""
  },
  {
    "key": "E5 GROUND TO LINE 3RACK",
    "place": "E5 GROUND TO LINE 3",
    "type": "RACK",
    "unit": "",
    "rate": 50,
    "part": "",
    "category": ""
  },
  {
    "key": "E5 GROUND TO E5RACK",
    "place": "E5 GROUND TO E5",
    "type": "RACK",
    "unit": "",
    "rate": 25,
    "part": "",
    "category": ""
  },
  {
    "key": "E5 GROUND TO DUYVISRACK",
    "place": "E5 GROUND TO DUYVIS",
    "type": "RACK",
    "unit": "",
    "rate": 25,
    "part": "",
    "category": ""
  },
  {
    "key": "E5 GROUND TO COCOARACK",
    "place": "E5 GROUND TO COCOA",
    "type": "RACK",
    "unit": "",
    "rate": 50,
    "part": "",
    "category": ""
  },
  {
    "key": "E5 GROUND FLOOR TO PRIYARACK",
    "place": "E5 GROUND FLOOR TO PRIYA",
    "type": "RACK",
    "unit": "",
    "rate": 25,
    "part": "",
    "category": ""
  },
  {
    "key": "E5 GROUND FLOOR TO LINE 3BOX",
    "place": "E5 GROUND FLOOR TO LINE 3",
    "type": "BOX",
    "unit": "",
    "rate": 1.5,
    "part": "",
    "category": ""
  },
  {
    "key": "E5 GROUND FLOOR TO LINE 3RACK",
    "place": "E5 GROUND FLOOR TO LINE 3",
    "type": "RACK",
    "unit": "",
    "rate": 50,
    "part": "",
    "category": ""
  },
  {
    "key": "E5 GROUND FLOOR TO DUYVISRACK",
    "place": "E5 GROUND FLOOR TO DUYVIS",
    "type": "RACK",
    "unit": "",
    "rate": 50,
    "part": "",
    "category": ""
  },
  {
    "key": "E5 GROUND FLOOR TO 10 TONRACK",
    "place": "E5 GROUND FLOOR TO 10 TON",
    "type": "RACK",
    "unit": "",
    "rate": 50,
    "part": "",
    "category": ""
  },
  {
    "key": "E5 GROUND 10 TON MALARACK",
    "place": "E5 GROUND 10 TON MALA",
    "type": "RACK",
    "unit": "",
    "rate": 25,
    "part": "",
    "category": ""
  },
  {
    "key": "DUYVIS TO STORERACK",
    "place": "DUYVIS TO STORE",
    "type": "RACK",
    "unit": "",
    "rate": 50,
    "part": "",
    "category": ""
  },
  {
    "key": "DUYVIS TO LINE 4RACK",
    "place": "DUYVIS TO LINE 4",
    "type": "RACK",
    "unit": "",
    "rate": 50,
    "part": "",
    "category": ""
  },
  {
    "key": "DUYVIS TO GROUND FLOORRACK",
    "place": "DUYVIS TO GROUND FLOOR",
    "type": "RACK",
    "unit": "",
    "rate": 25,
    "part": "",
    "category": ""
  },
  {
    "key": "DUYVIS TO E5RACK",
    "place": "DUYVIS TO E5",
    "type": "RACK",
    "unit": "",
    "rate": 50,
    "part": "",
    "category": ""
  },
  {
    "key": "DUYVIS TO CONTAINERRACK",
    "place": "DUYVIS TO CONTAINER",
    "type": "RACK",
    "unit": "",
    "rate": 50,
    "part": "",
    "category": ""
  },
  {
    "key": "DUYVIS TO COCOARACK",
    "place": "DUYVIS TO COCOA",
    "type": "RACK",
    "unit": "",
    "rate": 50,
    "part": "",
    "category": ""
  },
  {
    "key": "CONTAINER TO E5RACK",
    "place": "CONTAINER TO E5",
    "type": "RACK",
    "unit": "",
    "rate": 50,
    "part": "",
    "category": ""
  },
  {
    "key": "COMPANY TO PATEL GODOWNBUNDLE",
    "place": "COMPANY TO PATEL GODOWN",
    "type": "BUNDLE",
    "unit": "",
    "rate": 10,
    "part": "BKT",
    "category": ""
  },
  {
    "key": "COMPANY TO MANORANJAN GODOWNBUNDLE",
    "place": "COMPANY TO MANORANJAN GODOWN",
    "type": "BUNDLE",
    "unit": "",
    "rate": 10,
    "part": "",
    "category": ""
  },
  {
    "key": "COMPANY TO KALE GODOWNRACK",
    "place": "COMPANY TO KALE GODOWN",
    "type": "RACK",
    "unit": "",
    "rate": 100,
    "part": "",
    "category": ""
  },
  {
    "key": "COMPANY GODOWN TO COMPANYBAG50",
    "place": "COMPANY GODOWN TO COMPANY",
    "type": "BAG",
    "unit": "50",
    "rate": 6.8,
    "part": "",
    "category": ""
  },
  {
    "key": "COCOA TO STORERACK",
    "place": "COCOA TO STORE",
    "type": "RACK",
    "unit": "",
    "rate": 50,
    "part": "",
    "category": ""
  },
  {
    "key": "COCOA TO PRIYARACK",
    "place": "COCOA TO PRIYA",
    "type": "RACK",
    "unit": "",
    "rate": 50,
    "part": "",
    "category": ""
  },
  {
    "key": "COCOA TO OLD ACRACK",
    "place": "COCOA TO OLD AC",
    "type": "RACK",
    "unit": "",
    "rate": 50,
    "part": "",
    "category": ""
  },
  {
    "key": "COCOA TO LINE 4RACK",
    "place": "COCOA TO LINE 4",
    "type": "RACK",
    "unit": "",
    "rate": 50,
    "part": "",
    "category": ""
  },
  {
    "key": "COCOA TO LINE 3RACK",
    "place": "COCOA TO LINE 3",
    "type": "RACK",
    "unit": "",
    "rate": 50,
    "part": "",
    "category": ""
  },
  {
    "key": "COCOA TO GROUND FLOORRACK",
    "place": "COCOA TO GROUND FLOOR",
    "type": "RACK",
    "unit": "",
    "rate": 25,
    "part": "",
    "category": ""
  },
  {
    "key": "COCOA TO E5RACK",
    "place": "COCOA TO E5",
    "type": "RACK",
    "unit": "",
    "rate": 50,
    "part": "",
    "category": ""
  },
  {
    "key": "COCOA TO DUYVISRACK",
    "place": "COCOA TO DUYVIS",
    "type": "RACK",
    "unit": "",
    "rate": 50,
    "part": "",
    "category": ""
  },
  {
    "key": "BOUTIQ TO E5RACK",
    "place": "BOUTIQ TO E5",
    "type": "RACK",
    "unit": "",
    "rate": 50,
    "part": "",
    "category": ""
  },
  {
    "key": "BASEMENT TO E5RACK",
    "place": "BASEMENT TO E5",
    "type": "RACK",
    "unit": "",
    "rate": 25,
    "part": "",
    "category": ""
  },
  {
    "key": "BANGAR GODOWN TO COMPANYBAG25",
    "place": "BANGAR GODOWN TO COMPANY",
    "type": "BAG",
    "unit": "25",
    "rate": 3.6,
    "part": "",
    "category": ""
  },
  {
    "key": "BANGAR GODOWN TO COMPANYBARRAL250",
    "place": "BANGAR GODOWN TO COMPANY",
    "type": "BARRAL",
    "unit": "250",
    "rate": 16,
    "part": "",
    "category": ""
  },
  {
    "key": "BANGAR GODOWN TO COMPANYBARRAL250",
    "place": "BANGAR GODOWN TO COMPANY",
    "type": "BARRAL",
    "unit": "250",
    "rate": 16,
    "part": "",
    "category": ""
  },
  {
    "key": "AWASARI GODOWN TO COMPANY BUNDLE",
    "place": "AWASARI GODOWN TO COMPANY",
    "type": "BUNDLE",
    "unit": "",
    "rate": 2.8,
    "part": "",
    "category": "PM"
  },
  {
    "key": "40 TON TO E5RACK",
    "place": "40 TON TO E5",
    "type": "RACK",
    "unit": "",
    "rate": 50,
    "part": "",
    "category": ""
  },
  {
    "key": "30 TON TO E5RACK",
    "place": "30 TON TO E5",
    "type": "RACK",
    "unit": "",
    "rate": 50,
    "part": "",
    "category": ""
  },
  {
    "key": "1ST TO GROUND FLOORBAG25",
    "place": "1ST TO GROUND FLOOR",
    "type": "BAG",
    "unit": "25",
    "rate": 1.5,
    "part": "",
    "category": ""
  },
  {
    "key": "1ST FLOOR TO GROUND FLOORBAG",
    "place": "1ST FLOOR TO GROUND FLOOR",
    "type": "BAG",
    "unit": "",
    "rate": 1.5,
    "part": "",
    "category": ""
  },
  {
    "key": "1ST FLOOR TO GROUND FLOORBAG40",
    "place": "1ST FLOOR TO GROUND FLOOR",
    "type": "BAG",
    "unit": "40",
    "rate": 1.5,
    "part": "",
    "category": ""
  },
  {
    "key": "10 TON TO GROUND FLOORRACK",
    "place": "10 TON TO GROUND FLOOR",
    "type": "RACK",
    "unit": "",
    "rate": 25,
    "part": "",
    "category": ""
  },
  {
    "key": "10 TON TO E5RACK",
    "place": "10 TON TO E5",
    "type": "RACK",
    "unit": "",
    "rate": 50,
    "part": "",
    "category": "FG"
  },
  {
    "key": "10 TON TO 40 TONRACK",
    "place": "10 TON TO 40 TON",
    "type": "RACK",
    "unit": "",
    "rate": 25,
    "part": "",
    "category": ""
  },
  {
    "key": "UNLOADINGCAN",
    "place": "UNLOADING",
    "type": "CAN",
    "unit": "",
    "rate": 1.4,
    "part": "",
    "category": "RM"
  },
  {
    "key": "UNLOADINGBKT10",
    "place": "UNLOADING",
    "type": "BKT",
    "unit": "10",
    "rate": 1.4,
    "part": "",
    "category": ""
  },
  {
    "key": "UNLOADINGBAG10",
    "place": "UNLOADING",
    "type": "BAG",
    "unit": "10",
    "rate": 1.4,
    "part": "",
    "category": ""
  },
  {
    "key": "UNLOADINGCAN",
    "place": "UNLOADING",
    "type": "CAN",
    "unit": "",
    "rate": 1.4,
    "part": "",
    "category": ""
  },
  {
    "key": "LOADINGROLL",
    "place": "LOADING",
    "type": "ROLL",
    "unit": "",
    "rate": 1.2,
    "part": "",
    "category": "PM"
  },
  {
    "key": "THORAT GODOWN TO COMPANYBAG",
    "place": "THORAT GODOWN TO COMPANY",
    "type": "BAG",
    "unit": "",
    "rate": 2.8,
    "part": "",
    "category": "RM"
  },
  {
    "key": "BANGAR GODOWN TO COMPANYBAG",
    "place": "BANGAR GODOWN TO COMPANY",
    "type": "BAG",
    "unit": "",
    "rate": 2.8,
    "part": "",
    "category": "RM"
  },
  {
    "key": "E5 GROUND FLOOR TO SGLRACK",
    "place": "E5 GROUND FLOOR TO SGL",
    "type": "RACK",
    "unit": "",
    "rate": 50,
    "part": "",
    "category": ""
  },
  {
    "key": "NEW AWASARI GODOWN TO COMPANYBAG25",
    "place": "NEW AWASARI GODOWN TO COMPANY",
    "type": "BAG",
    "unit": "25",
    "rate": 3.6,
    "part": "",
    "category": ""
  },
  {
    "key": "E5 GROUND FLOOR TO COCOARACK",
    "place": "E5 GROUND FLOOR TO COCOA",
    "type": "RACK",
    "unit": "",
    "rate": 50,
    "part": "",
    "category": ""
  },
  {
    "key": "PACKAGINGRACK",
    "place": "PACKAGING",
    "type": "RACK",
    "unit": "",
    "rate": 20,
    "part": "",
    "category": ""
  },
  {
    "key": "E5 GROUND TO 10 TONRACK",
    "place": "E5 GROUND TO 10 TON",
    "type": "RACK",
    "unit": "",
    "rate": 50,
    "part": "",
    "category": ""
  },
  {
    "key": "KALE GODOWN TO COMPANYBOX",
    "place": "KALE GODOWN TO COMPANY",
    "type": "BOX",
    "unit": "",
    "rate": 2.8,
    "part": "",
    "category": ""
  },
  {
    "key": "E5 GROUND FLOOR TO OLD ACRACK",
    "place": "E5 GROUND FLOOR TO OLD AC",
    "type": "RACK",
    "unit": "",
    "rate": 50,
    "part": "",
    "category": ""
  },
  {
    "key": "CONTAINER TO COMPANYBAG",
    "place": "CONTAINER TO COMPANY",
    "type": "BAG",
    "unit": "",
    "rate": 1.5,
    "part": "",
    "category": ""
  },
  {
    "key": "BENDE GODOWN TO COMPANYBKT25",
    "place": "BENDE GODOWN TO COMPANY",
    "type": "BKT",
    "unit": "25",
    "rate": 3.6,
    "part": "",
    "category": ""
  },
  {
    "key": "OLD AWASARI GODOWN TO COMPANYBUNDLE",
    "place": "OLD AWASARI GODOWN TO COMPANY",
    "type": "BUNDLE",
    "unit": "",
    "rate": 2.8,
    "part": "",
    "category": ""
  },
  {
    "key": "BASEMNET TO E5RACK",
    "place": "BASEMNET TO E5",
    "type": "RACK",
    "unit": "",
    "rate": 25,
    "part": "",
    "category": ""
  },
  {
    "key": "E5 TO SGLBUNDLE",
    "place": "E5 TO SGL",
    "type": "BUNDLE",
    "unit": "",
    "rate": 1.5,
    "part": "",
    "category": ""
  },
  {
    "key": "ROOM NO 1 TO ROOM NO 2RACK",
    "place": "ROOM NO 1 TO ROOM NO 2",
    "type": "RACK",
    "unit": "",
    "rate": 25,
    "part": "",
    "category": ""
  },
  {
    "key": "E5 BASEMENT TO E5RACK",
    "place": "E5 BASEMENT TO E5",
    "type": "RACK",
    "unit": "",
    "rate": 25,
    "part": "",
    "category": ""
  },
  {
    "key": "E5 TO 30 TONRACK",
    "place": "E5 TO 30 TON",
    "type": "RACK",
    "unit": "",
    "rate": 50,
    "part": "",
    "category": ""
  },
  {
    "key": "OLD AC TO LINE 2RACK",
    "place": "OLD AC TO LINE 2",
    "type": "RACK",
    "unit": "",
    "rate": 50,
    "part": "",
    "category": ""
  },
  {
    "key": "CHAMNER 3 TO CHAMABERRACK",
    "place": "CHAMNER 3 TO CHAMABER",
    "type": "RACK",
    "unit": "",
    "rate": 25,
    "part": "",
    "category": ""
  },
  {
    "key": "E5 TO LINE 2RACK",
    "place": "E5 TO LINE 2",
    "type": "RACK",
    "unit": "",
    "rate": 50,
    "part": "",
    "category": ""
  },
  {
    "key": "PARIHAR GODOWN TO COMPANYBOX10",
    "place": "PARIHAR GODOWN TO COMPANY",
    "type": "BOX",
    "unit": "10",
    "rate": 2.8,
    "part": "",
    "category": ""
  },
  {
    "key": "JEEVAN GODOWN TO COMPANYBAG50",
    "place": "JEEVAN GODOWN TO COMPANY",
    "type": "BAG",
    "unit": "50",
    "rate": 6.8,
    "part": "",
    "category": ""
  },
  {
    "key": "UNLOADINGBKT25",
    "place": "UNLOADING",
    "type": "BKT",
    "unit": "25",
    "rate": 1.7,
    "part": "",
    "category": ""
  },
  {
    "key": "LOADINGBKT25",
    "place": "LOADING",
    "type": "BKT",
    "unit": "25",
    "rate": 1.7,
    "part": "O",
    "category": ""
  },
  {
    "key": "10 TON TO DUYVISRACK",
    "place": "10 TON TO DUYVIS",
    "type": "RACK",
    "unit": "",
    "rate": 50,
    "part": "",
    "category": ""
  },
  {
    "key": "1ST FLOOR TO GROUND FLOORRACK",
    "place": "1ST FLOOR TO GROUND FLOOR",
    "type": "RACK",
    "unit": "",
    "rate": 25,
    "part": "",
    "category": ""
  },
  {
    "key": "AWASARI GODOWN TO COMPANYBAG",
    "place": "AWASARI GODOWN TO COMPANY",
    "type": "BAG",
    "unit": "",
    "rate": 2.8,
    "part": "",
    "category": ""
  },
  {
    "key": "AWASARI GODOWN TO COMPANY BOX",
    "place": "AWASARI GODOWN TO COMPANY",
    "type": "BOX",
    "unit": "",
    "rate": 2.8,
    "part": "",
    "category": ""
  },
  {
    "key": "SAMADDIYA GODOWN TO COMPANYBOX",
    "place": "SAMADDIYA GODOWN TO COMPANY",
    "type": "BOX",
    "unit": "",
    "rate": 2.8,
    "part": "",
    "category": ""
  },
  {
    "key": "DUYVIS TO 10 TONBUNDLE",
    "place": "DUYVIS TO 10 TON",
    "type": "BUNDLE",
    "unit": "",
    "rate": 1.5,
    "part": "",
    "category": ""
  },
  {
    "key": "LOADINGBARRAL250",
    "place": "LOADING",
    "type": "BARRAL",
    "unit": "250",
    "rate": 8,
    "part": "",
    "category": ""
  },
  {
    "key": "PARIHAR GODOWN TO COMPANYBARRAL250",
    "place": "PARIHAR GODOWN TO COMPANY",
    "type": "BARRAL",
    "unit": "250",
    "rate": 16,
    "part": "",
    "category": ""
  },
  {
    "key": "BENDE GODOWN TO COMPANYBARRAL250",
    "place": "BENDE GODOWN TO COMPANY",
    "type": "BARRAL",
    "unit": "250",
    "rate": 16,
    "part": "",
    "category": ""
  },
  {
    "key": "1 NO ROOM TO 2 NO ROOMRACK",
    "place": "1 NO ROOM TO 2 NO ROOM",
    "type": "RACK",
    "unit": "",
    "rate": 25,
    "part": "",
    "category": ""
  },
  {
    "key": "BENDE GODOWN TO COMPANYBAG25",
    "place": "BENDE GODOWN TO COMPANY",
    "type": "BAG",
    "unit": "25",
    "rate": 3.6,
    "part": "",
    "category": ""
  },
  {
    "key": "BHARADI GODOWN TO COMPANY BAG62",
    "place": "BHARADI GODOWN TO COMPANY",
    "type": "BAG",
    "unit": "62",
    "rate": 6.8,
    "part": "",
    "category": ""
  },
  {
    "key": "BOILER TO COMPANYTINS",
    "place": "BOILER TO COMPANY",
    "type": "TINS",
    "unit": "",
    "rate": 1.5,
    "part": "",
    "category": ""
  },
  {
    "key": "CONTAINER TO COMPANYRACK",
    "place": "CONTAINER TO COMPANY",
    "type": "RACK",
    "unit": "",
    "rate": 100,
    "part": "",
    "category": ""
  },
  {
    "key": "CONTAINER TO COMPANYBOX",
    "place": "CONTAINER TO COMPANY",
    "type": "BOX",
    "unit": "",
    "rate": 2.8,
    "part": "",
    "category": ""
  },
  {
    "key": "NEW AWASARI GODOWN TO COMPANYBOX25",
    "place": "NEW AWASARI GODOWN TO COMPANY",
    "type": "BOX",
    "unit": "25",
    "rate": 3.6,
    "part": "",
    "category": ""
  },
  {
    "key": "GROUND FLOOR TO 1ST FLOORBOX",
    "place": "GROUND FLOOR TO 1ST FLOOR",
    "type": "BOX",
    "unit": "",
    "rate": 1.5,
    "part": "",
    "category": ""
  },
  {
    "key": "SGL TO E5 RACK",
    "place": "SGL TO E5",
    "type": "RACK",
    "unit": "",
    "rate": 50,
    "part": "",
    "category": ""
  },
  {
    "key": "OLD AC TO BASEMENT RACK",
    "place": "OLD AC TO BASEMENT",
    "type": "RACK",
    "unit": "",
    "rate": 25,
    "part": "",
    "category": ""
  },
  {
    "key": "GROUND FLOOR TO BASEMENT RACK",
    "place": "GROUND FLOOR TO BASEMENT",
    "type": "RACK",
    "unit": "",
    "rate": 25,
    "part": "",
    "category": ""
  },
  {
    "key": "GROUND FLOOR TO BASEMENT RACK",
    "place": "GROUND FLOOR TO BASEMENT",
    "type": "RACK",
    "unit": "",
    "rate": 25,
    "part": "",
    "category": ""
  },
  {
    "key": "E5 GROUND TO PRIYA RACK",
    "place": "E5 GROUND TO PRIYA",
    "type": "RACK",
    "unit": "",
    "rate": 25,
    "part": "",
    "category": ""
  },
  {
    "key": "LINE 4 TO BUTTING RACK",
    "place": "LINE 4 TO BUTTING",
    "type": "RACK",
    "unit": "",
    "rate": 50,
    "part": "",
    "category": ""
  },
  {
    "key": "GROUND FLOOR TO 1ST FLOORTINS25",
    "place": "GROUND FLOOR TO 1ST FLOOR",
    "type": "TINS",
    "unit": "25",
    "rate": 1.5,
    "part": "",
    "category": ""
  },
  {
    "key": "GROUND FLOOR TO STORE MALA TINS25",
    "place": "GROUND FLOOR TO STORE MALA",
    "type": "TINS",
    "unit": "25",
    "rate": 1.5,
    "part": "",
    "category": ""
  },
  {
    "key": "COMPANY TO PARIHAR GODOWN RACK",
    "place": "COMPANY TO PARIHAR GODOWN",
    "type": "RACK",
    "unit": "",
    "rate": 100,
    "part": "",
    "category": ""
  },
  {
    "key": "COMPANY TO BHARADI GODOWN RACK",
    "place": "COMPANY TO BHARADI GODOWN",
    "type": "RACK",
    "unit": "",
    "rate": 100,
    "part": "",
    "category": ""
  },
  {
    "key": "1 NO CONTAINER TO 2 NO CONTAINERRACK",
    "place": "1 NO CONTAINER TO 2 NO CONTAINER",
    "type": "RACK",
    "unit": "",
    "rate": 25,
    "part": "",
    "category": ""
  },
  {
    "key": "10 TON TO OLD ACRACK",
    "place": "10 TON TO OLD AC",
    "type": "RACK",
    "unit": "",
    "rate": 50,
    "part": "",
    "category": ""
  },
  {
    "key": "10 TON TO PRIYA RACK",
    "place": "10 TON TO PRIYA",
    "type": "RACK",
    "unit": "",
    "rate": 25,
    "part": "",
    "category": ""
  },
  {
    "key": "AWASARI GODOWN TO COMPANYBARRAL250",
    "place": "AWASARI GODOWN TO COMPANY",
    "type": "BARRAL",
    "unit": "250",
    "rate": 16,
    "part": "",
    "category": ""
  },
  {
    "key": "WARFARE TINS",
    "place": "WARFARE",
    "type": "TINS",
    "unit": "",
    "rate": 0.8,
    "part": "",
    "category": ""
  },
  {
    "key": "WARFARE BARRAL 250",
    "place": "WARFARE",
    "type": "BARRAL",
    "unit": "250",
    "rate": 0.8,
    "part": "",
    "category": ""
  },
  {
    "key": "BANGAR GODOWN TO COMPANY BOX 25",
    "place": "BANGAR GODOWN TO COMPANY",
    "type": "BOX",
    "unit": "25",
    "rate": 3.6,
    "part": "",
    "category": ""
  },
  {
    "key": "BANGAR GODOWN TO COMPANY TINS 15",
    "place": "BANGAR GODOWN TO COMPANY",
    "type": "TINS",
    "unit": "15",
    "rate": 2.8,
    "part": "",
    "category": ""
  },
  {
    "key": "BANGAR GODOWN TO COMPANY BOX15",
    "place": "BANGAR GODOWN TO COMPANY",
    "type": "BOX",
    "unit": "15",
    "rate": 2.8,
    "part": "",
    "category": ""
  },
  {
    "key": "BASEMENT TO PRIYARACK",
    "place": "BASEMENT TO PRIYA",
    "type": "RACK",
    "unit": "",
    "rate": 25,
    "part": "",
    "category": ""
  },
  {
    "key": "BASEMENT TO PRIYABUNDLE",
    "place": "BASEMENT TO PRIYA",
    "type": "BUNDLE",
    "unit": "",
    "rate": 1.5,
    "part": "",
    "category": ""
  },
  {
    "key": "BENDE GODOWN TO COMPANYBOX",
    "place": "BENDE GODOWN TO COMPANY",
    "type": "BOX",
    "unit": "",
    "rate": 3.6,
    "part": "",
    "category": ""
  },
  {
    "key": "BLUE RACK TO LOKHANDI RACK BKT",
    "place": "BLUE RACK TO LOKHANDI RACK",
    "type": "BKT",
    "unit": "",
    "rate": 0.5,
    "part": "",
    "category": ""
  },
  {
    "key": "STORE TO OLD ACRACK",
    "place": "STORE TO OLD AC",
    "type": "RACK",
    "unit": "",
    "rate": 50,
    "part": "",
    "category": ""
  },
  {
    "key": "E5 TO PRIYABUNDLE",
    "place": "E5 TO PRIYA",
    "type": "BUNDLE",
    "unit": "",
    "rate": 1.5,
    "part": "",
    "category": ""
  },
  {
    "key": "KALE GODOWN TO COMPANYBAG62",
    "place": "KALE GODOWN TO COMPANY",
    "type": "BAG",
    "unit": "62",
    "rate": 6.8,
    "part": "",
    "category": ""
  },
  {
    "key": "NEW AWASARI GODOWN TO COMPANYBARRAL250",
    "place": "NEW AWASARI GODOWN TO COMPANY",
    "type": "BARRAL",
    "unit": "250",
    "rate": 16,
    "part": "",
    "category": ""
  },
  {
    "key": "COMPANY TO PRATIK GODOWNBUNDLE",
    "place": "COMPANY TO PRATIK GODOWN",
    "type": "BUNDLE",
    "unit": "",
    "rate": 2.8,
    "part": "",
    "category": ""
  },
  {
    "key": "LANDEWADI GODOWN TO COMPANYBOX",
    "place": "LANDEWADI GODOWN TO COMPANY",
    "type": "BOX",
    "unit": "",
    "rate": 2.8,
    "part": "",
    "category": ""
  },
  {
    "key": "NEW LANDEWADI GODOWN TO COMPANYBOX25",
    "place": "NEW LANDEWADI GODOWN TO COMPANY",
    "type": "BOX",
    "unit": "25",
    "rate": 3.6,
    "part": "",
    "category": ""
  },
  {
    "key": "PARIHAR GODOWN TO COMPANYBAG",
    "place": "PARIHAR GODOWN TO COMPANY",
    "type": "BAG",
    "unit": "",
    "rate": 2.8,
    "part": "",
    "category": ""
  },
  {
    "key": "KALE GODOWN TO COMPANYBOX25",
    "place": "KALE GODOWN TO COMPANY",
    "type": "BOX",
    "unit": "25",
    "rate": 3.6,
    "part": "",
    "category": ""
  },
  {
    "key": "LANDEWADI GODOWN TO COMPANYBAG50",
    "place": "LANDEWADI GODOWN TO COMPANY",
    "type": "BAG",
    "unit": "50",
    "rate": 6.8,
    "part": "",
    "category": ""
  },
  {
    "key": "PRIYA TO BASEMENTRACK",
    "place": "PRIYA TO BASEMENT",
    "type": "RACK",
    "unit": "",
    "rate": 25,
    "part": "",
    "category": ""
  },
  {
    "key": "GROUND FLOOR TO 1ST FLOORBAG25",
    "place": "GROUND FLOOR TO 1ST FLOOR",
    "type": "BAG",
    "unit": "25",
    "rate": 1.5,
    "part": "",
    "category": ""
  },
  {
    "key": "STORE TO STORE MALABOX25",
    "place": "STORE TO STORE MALA",
    "type": "BOX",
    "unit": "25",
    "rate": 1.5,
    "part": "",
    "category": ""
  },
  {
    "key": "UNLOADING BKTBUNDLE",
    "place": "UNLOADING BKT",
    "type": "BUNDLE",
    "unit": "",
    "rate": 5,
    "part": "",
    "category": ""
  },
  {
    "key": "LOADING BKTBUNDLE",
    "place": "LOADING BKT",
    "type": "BUNDLE",
    "unit": "",
    "rate": 5,
    "part": "",
    "category": ""
  },
  {
    "key": "STORE TO STORE MALACAN",
    "place": "STORE TO STORE MALA",
    "type": "CAN",
    "unit": "",
    "rate": 1.5,
    "part": "",
    "category": ""
  },
  {
    "key": "STORE TO ENGINEERING STORENOS",
    "place": "STORE TO ENGINEERING STORE",
    "type": "NOS",
    "unit": "",
    "rate": 1.5,
    "part": "",
    "category": ""
  },
  {
    "key": "GATE TO ENGINEERING STORENOS",
    "place": "GATE TO ENGINEERING STORE",
    "type": "NOS",
    "unit": "",
    "rate": 1.5,
    "part": "",
    "category": ""
  },
  {
    "key": "OLD AWASARI GODOWN TO COMPANYBARRAL250",
    "place": "OLD AWASARI GODOWN TO COMPANY",
    "type": "BARRAL",
    "unit": "250",
    "rate": 16,
    "part": "",
    "category": ""
  },
  {
    "key": "SAMADDIYA GODOWN TO COMPANYBOX25",
    "place": "SAMADDIYA GODOWN TO COMPANY",
    "type": "BOX",
    "unit": "25",
    "rate": 3.6,
    "part": "",
    "category": ""
  },
  {
    "key": "LOADINGBAG",
    "place": "LOADING",
    "type": "BAG",
    "unit": "",
    "rate": 1.4,
    "part": "",
    "category": ""
  },
  {
    "key": "GROUND FLOOR TO STORE MALABAG25",
    "place": "GROUND FLOOR TO STORE MALA",
    "type": "BAG",
    "unit": "25",
    "rate": 1.5,
    "part": "",
    "category": ""
  },
  {
    "key": "PARIHAR GODOWN TO COMPANYBAG25",
    "place": "PARIHAR GODOWN TO COMPANY",
    "type": "BAG",
    "unit": "25",
    "rate": 3.4,
    "part": "",
    "category": ""
  },
  {
    "key": "LINE 4 TO DUYVISRACK",
    "place": "LINE 4 TO DUYVIS",
    "type": "RACK",
    "unit": "",
    "rate": 50,
    "part": "",
    "category": ""
  },
  {
    "key": "PRIYA TO COCOA RACK",
    "place": "PRIYA TO COCOA",
    "type": "RACK",
    "unit": "",
    "rate": 25,
    "part": "",
    "category": ""
  },
  {
    "key": "E5 GROUND FLOOR TO E5RACK",
    "place": "E5 GROUND FLOOR TO E5",
    "type": "RACK",
    "unit": "",
    "rate": 25,
    "part": "",
    "category": ""
  },
  {
    "key": "LINE 4 TO GROUND FLOORRACK",
    "place": "LINE 4 TO GROUND FLOOR",
    "type": "RACK",
    "unit": "",
    "rate": 25,
    "part": "",
    "category": ""
  },
  {
    "key": "LOADING FGBOX25",
    "place": "LOADING FG",
    "type": "BOX",
    "unit": "25",
    "rate": 1.7,
    "part": "",
    "category": ""
  },
  {
    "key": "E5 TO RND ROOMRACK",
    "place": "E5 TO RND ROOM",
    "type": "RACK",
    "unit": "",
    "rate": 25,
    "part": "",
    "category": ""
  },
  {
    "key": "PRIYA TO 10 TONRACK",
    "place": "PRIYA TO 10 TON",
    "type": "RACK",
    "unit": "",
    "rate": 25,
    "part": "",
    "category": ""
  },
  {
    "key": "IN TANK TO OUT TANKTON",
    "place": "IN TANK TO OUT TANK",
    "type": "TON",
    "unit": "",
    "rate": 15,
    "part": "",
    "category": ""
  },
  {
    "key": "GATE TO ENGINEERING STOREBOX",
    "place": "GATE TO ENGINEERING STORE",
    "type": "BOX",
    "unit": "",
    "rate": 1.5,
    "part": "",
    "category": ""
  },
  {
    "key": "COCOA TO BUTIQUERACK",
    "place": "COCOA TO BUTIQUE",
    "type": "RACK",
    "unit": "",
    "rate": 50,
    "part": "",
    "category": ""
  },
  {
    "key": "GROUND FLOOR TO 1ST FLOORNOS",
    "place": "GROUND FLOOR TO 1ST FLOOR",
    "type": "NOS",
    "unit": "",
    "rate": 1.5,
    "part": "",
    "category": ""
  },
  {
    "key": "NEW NARODI GODOWN TO COMPANYBAG",
    "place": "NEW NARODI GODOWN TO COMPANY",
    "type": "BAG",
    "unit": "",
    "rate": 2.8,
    "part": "",
    "category": ""
  },
  {
    "key": "STORE FULL DAYMEN",
    "place": "STORE FULL DAY",
    "type": "MEN",
    "unit": "",
    "rate": 400,
    "part": "",
    "category": ""
  },
  {
    "key": "THORAT GODOWN TO COMPANYBAG",
    "place": "THORAT GODOWN TO COMPANY",
    "type": "BAG",
    "unit": "",
    "rate": 6.8,
    "part": "",
    "category": ""
  },
  {
    "key": "BOILER TO COMPANYBAG",
    "place": "BOILER TO COMPANY",
    "type": "BAG",
    "unit": "",
    "rate": 1.5,
    "part": "",
    "category": ""
  },
  {
    "key": "PETH GODOWN TO COMPANYBAG62",
    "place": "PETH GODOWN TO COMPANY",
    "type": "BAG",
    "unit": "62",
    "rate": 6.8,
    "part": "",
    "category": ""
  },
  {
    "key": "BOILER TO COMPANYBOX",
    "place": "BOILER TO COMPANY",
    "type": "BOX",
    "unit": "",
    "rate": 1.5,
    "part": "",
    "category": ""
  },
  {
    "key": "CONTAINER NO 4 TO CONTAINER NO 5 RACK",
    "place": "CONTAINER NO 4 TO CONTAINER NO 5",
    "type": "RACK",
    "unit": "",
    "rate": 25,
    "part": "",
    "category": ""
  },
  {
    "key": "SHELAR GODOWN TO COMPANY BKTBUNDLE",
    "place": "SHELAR GODOWN TO COMPANY BKT",
    "type": "BUNDLE",
    "unit": "",
    "rate": 10,
    "part": "",
    "category": ""
  },
  {
    "key": "PRATIK GODOWN TO COMPANY BKTBUNDLE",
    "place": "PRATIK GODOWN TO COMPANY BKT",
    "type": "BUNDLE",
    "unit": "",
    "rate": 10,
    "part": "",
    "category": ""
  },
  {
    "key": "PRATIK GODOWN TO COMPANY BKTBUNDLE",
    "place": "PRATIK GODOWN TO COMPANY BKT",
    "type": "BUNDLE",
    "unit": "",
    "rate": 10,
    "part": "",
    "category": ""
  },
  {
    "key": "PATEL GODOWN TO COMPANY BKTBUNDLE",
    "place": "PATEL GODOWN TO COMPANY BKT",
    "type": "BUNDLE",
    "unit": "",
    "rate": 10,
    "part": "",
    "category": ""
  },
  {
    "key": "PATEL GODOWN TO COMPANY BKTBUNDLE",
    "place": "PATEL GODOWN TO COMPANY BKT",
    "type": "BUNDLE",
    "unit": "",
    "rate": 10,
    "part": "",
    "category": ""
  },
  {
    "key": "PATEL GODOWN TO COMPANY BKTBUNDLE",
    "place": "PATEL GODOWN TO COMPANY BKT",
    "type": "BUNDLE",
    "unit": "",
    "rate": 10,
    "part": "",
    "category": ""
  },
  {
    "key": "PATEL GODOWN TO COMPANY BKTBUNDLE",
    "place": "PATEL GODOWN TO COMPANY BKT",
    "type": "BUNDLE",
    "unit": "",
    "rate": 10,
    "part": "",
    "category": ""
  },
  {
    "key": "MANORANJAN GODOWN TO COMPANY BKTBUNDLE",
    "place": "MANORANJAN GODOWN TO COMPANY BKT",
    "type": "BUNDLE",
    "unit": "",
    "rate": 10,
    "part": "",
    "category": ""
  },
  {
    "key": "MANORANJAN GODOWN TO COMPANY BKTBUNDLE",
    "place": "MANORANJAN GODOWN TO COMPANY BKT",
    "type": "BUNDLE",
    "unit": "",
    "rate": 10,
    "part": "",
    "category": ""
  },
  {
    "key": "KAULE MALA GODOWN TO COMPANY BKTBUNDLE",
    "place": "KAULE MALA GODOWN TO COMPANY BKT",
    "type": "BUNDLE",
    "unit": "",
    "rate": 10,
    "part": "",
    "category": ""
  },
  {
    "key": "COMPANY TO PATEL GODOWN BKTBUNDLE",
    "place": "COMPANY TO PATEL GODOWN BKT",
    "type": "BUNDLE",
    "unit": "",
    "rate": 10,
    "part": "",
    "category": ""
  },
  {
    "key": "COMPANY TO MANORANJAN GODOWN BKTBUNDLE",
    "place": "COMPANY TO MANORANJAN GODOWN BKT",
    "type": "BUNDLE",
    "unit": "",
    "rate": 10,
    "part": "",
    "category": ""
  },
  {
    "key": "AWASARI GODOWN TO COMPANY BKTBUNDLE",
    "place": "AWASARI GODOWN TO COMPANY BKT",
    "type": "BUNDLE",
    "unit": "",
    "rate": 10,
    "part": "",
    "category": ""
  },
  {
    "key": "OLD AWASARI GODOWN TO COMPANY BKTBUNDLE",
    "place": "OLD AWASARI GODOWN TO COMPANY BKT",
    "type": "BUNDLE",
    "unit": "",
    "rate": 10,
    "part": "",
    "category": ""
  },
  {
    "key": "COMPANY TO PRATIK GODOWN BKTBUNDLE",
    "place": "COMPANY TO PRATIK GODOWN BKT",
    "type": "BUNDLE",
    "unit": "",
    "rate": 10,
    "part": "",
    "category": ""
  },
  {
    "key": "PARIHAR GODOWN TO COMPANYBAG25RM",
    "place": "PARIHAR GODOWN TO COMPANY",
    "type": "BAG",
    "unit": "25",
    "rate": 3.6,
    "part": "",
    "category": "RM"
  },
  {
    "key": "ENGINEERIND STORE Hours",
    "place": "ENGINEERIND STORE",
    "type": "Hours",
    "unit": "",
    "rate": 50,
    "part": "",
    "category": ""
  },
  {
    "key": "ENGINEERIND STORE Day",
    "place": "ENGINEERIND STORE",
    "type": "Day",
    "unit": "",
    "rate": 400,
    "part": "",
    "category": ""
  },
  {
    "key": "NEW LANDEWADI GODOWN TO COMPANYBOX",
    "place": "NEW LANDEWADI GODOWN TO COMPANY",
    "type": "BOX",
    "unit": "",
    "rate": 1.4,
    "part": "",
    "category": ""
  },
  {
    "key": "COMPANY GODOWN TO COMPANYBAG",
    "place": "COMPANY GODOWN TO COMPANY",
    "type": "BAG",
    "unit": "",
    "rate": 3.6,
    "part": "",
    "category": ""
  },
  {
    "key": "STORE TO STORE MALABAG",
    "place": "STORE TO STORE MALA",
    "type": "BAG",
    "unit": "",
    "rate": 1.5,
    "part": "",
    "category": ""
  },
  {
    "key": "STORE TO STORE MALANOS",
    "place": "STORE TO STORE MALA",
    "type": "NOS",
    "unit": "",
    "rate": 1.5,
    "part": "",
    "category": ""
  },
  {
    "key": "GROUND FLOOR TO 10 TON MALABUNDLE",
    "place": "GROUND FLOOR TO 10 TON MALA",
    "type": "BUNDLE",
    "unit": "",
    "rate": 1.5,
    "part": "",
    "category": ""
  },
  {
    "key": "GROUND FLOOR TO 10 TON MALARACK",
    "place": "GROUND FLOOR TO 10 TON MALA",
    "type": "RACK",
    "unit": "",
    "rate": 25,
    "part": "",
    "category": ""
  },
  {
    "key": "GROUND FLOOR TO 10 TON MALA BKTBUNDLE",
    "place": "GROUND FLOOR TO 10 TON MALA BKT",
    "type": "BUNDLE",
    "unit": "",
    "rate": 10,
    "part": "",
    "category": ""
  },
  {
    "key": "NEW LANDEWADI GODOWN TO COMPANYBAG25",
    "place": "NEW LANDEWADI GODOWN TO COMPANY",
    "type": "BAG",
    "unit": "25",
    "rate": 3.6,
    "part": "",
    "category": ""
  },
  {
    "key": "PARIHAR GODOWN TO COMPANYBOX20",
    "place": "PARIHAR GODOWN TO COMPANY",
    "type": "BOX",
    "unit": "20",
    "rate": 2.8,
    "part": "",
    "category": ""
  },
  {
    "key": "HANDLINGRACK",
    "place": "HANDLING",
    "type": "RACK",
    "unit": "",
    "rate": 3,
    "part": "",
    "category": ""
  },
  {
    "key": "E5 BASEMENT TO 10 TONRACK",
    "place": "E5 BASEMENT TO 10 TON",
    "type": "RACK",
    "unit": "",
    "rate": 25,
    "part": "",
    "category": ""
  },
  {
    "key": "E5 BASEMENT TO PRIYARACK",
    "place": "E5 BASEMENT TO PRIYA",
    "type": "RACK",
    "unit": "",
    "rate": 25,
    "part": "",
    "category": ""
  },
  {
    "key": "E5 BASEMENT TO COCOARACK",
    "place": "E5 BASEMENT TO COCOA",
    "type": "RACK",
    "unit": "",
    "rate": 25,
    "part": "",
    "category": ""
  },
  {
    "key": "E5 BASEMENT TO SGLRACK",
    "place": "E5 BASEMENT TO SGL",
    "type": "RACK",
    "unit": "",
    "rate": 25,
    "part": "",
    "category": ""
  },
  {
    "key": "E5 BASEMENT TO OLD ACRACK",
    "place": "E5 BASEMENT TO OLD AC",
    "type": "RACK",
    "unit": "",
    "rate": 25,
    "part": "",
    "category": ""
  },
  {
    "key": "E5 BASEMENT TO MORDERACK",
    "place": "E5 BASEMENT TO MORDE",
    "type": "RACK",
    "unit": "",
    "rate": 25,
    "part": "",
    "category": ""
  },
  {
    "key": "REARRANGINGBKT",
    "place": "REARRANGING",
    "type": "BKT",
    "unit": "",
    "rate": 0.5,
    "part": "",
    "category": ""
  },
  {
    "key": "COCOA TO E5RACK",
    "place": "COCOA TO E5",
    "type": "RACK",
    "unit": "",
    "rate": 50,
    "part": "",
    "category": ""
  },
  {
    "key": "DUYIS TO GROUND FLOORRACK",
    "place": "DUYIS TO GROUND FLOOR",
    "type": "RACK",
    "unit": "",
    "rate": 25,
    "part": "",
    "category": ""
  },
  {
    "key": "E5 TO DUYIS RACK",
    "place": "E5 TO DUYIS",
    "type": "RACK",
    "unit": "",
    "rate": 50,
    "part": "",
    "category": ""
  },
  {
    "key": "DUYIS TO E5RACK",
    "place": "DUYIS TO E5",
    "type": "RACK",
    "unit": "",
    "rate": 50,
    "part": "",
    "category": ""
  },
  {
    "key": "LOADING OR UNLOADINGRACK",
    "place": "LOADING OR UNLOADING",
    "type": "RACK",
    "unit": "",
    "rate": 50,
    "part": "",
    "category": ""
  },
  {
    "key": "GROUND FLOOR TO E5 RACK",
    "place": "GROUND FLOOR TO E5",
    "type": "RACK",
    "unit": "",
    "rate": 25,
    "part": "",
    "category": ""
  },
  {
    "key": "UNLOADING FGBAG25",
    "place": "UNLOADING FG",
    "type": "BAG",
    "unit": "25",
    "rate": 1.7,
    "part": "25",
    "category": ""
  },
  {
    "key": "GODOWN TO COMPANYBAG25",
    "place": "GODOWN TO COMPANY",
    "type": "BAG",
    "unit": "25",
    "rate": 3.6,
    "part": "",
    "category": ""
  },
  {
    "key": "LOADING & UNLOADING CAN",
    "place": "LOADING & UNLOADING",
    "type": "CAN",
    "unit": "",
    "rate": 2.8,
    "part": "",
    "category": ""
  },
  {
    "key": "GROUND FLOOR TO ENGINEERING STORESNOS",
    "place": "GROUND FLOOR TO ENGINEERING STORES",
    "type": "NOS",
    "unit": "",
    "rate": 1.5,
    "part": "",
    "category": ""
  },
  {
    "key": "POURINGBARREL",
    "place": "POURING",
    "type": "BARREL",
    "unit": "",
    "rate": 5,
    "part": "",
    "category": ""
  },
  {
    "key": "UNLOADINGMOTOR",
    "place": "UNLOADING",
    "type": "MOTOR",
    "unit": "",
    "rate": 6,
    "part": "",
    "category": ""
  },
  {
    "key": "GROUND FLOOR TO FIRST FLOORBOX",
    "place": "GROUND FLOOR TO FIRST FLOOR",
    "type": "BOX",
    "unit": "",
    "rate": 1.5,
    "part": "",
    "category": ""
  },
  {
    "key": "Godown to CompanyBARREL",
    "place": "Godown to Company",
    "type": "BARREL",
    "unit": "",
    "rate": 16,
    "part": "",
    "category": ""
  },
  {
    "key": "GODOWN TO COMPANYBOX",
    "place": "GODOWN TO COMPANY",
    "type": "BOX",
    "unit": "",
    "rate": 2.8,
    "part": "",
    "category": ""
  },
  {
    "key": "REARRANGINGBOX",
    "place": "REARRANGING",
    "type": "BOX",
    "unit": "",
    "rate": 0.5,
    "part": "",
    "category": ""
  },
  {
    "key": "Godown to CompanyBAG62",
    "place": "Godown to Company",
    "type": "BAG",
    "unit": "62",
    "rate": 6.8,
    "part": "",
    "category": ""
  },
  {
    "key": "BUILDING TO BUILDINGRACK",
    "place": "BUILDING TO BUILDING",
    "type": "RACK",
    "unit": "",
    "rate": 50,
    "part": "",
    "category": ""
  },
  {
    "key": "BUILDING TO GROUND FLOORBAG",
    "place": "BUILDING TO GROUND FLOOR",
    "type": "BAG",
    "unit": "",
    "rate": 1.5,
    "part": "",
    "category": ""
  },
  {
    "key": "E5 TO MORDEBAG",
    "place": "E5 TO MORDE",
    "type": "BAG",
    "unit": "",
    "rate": 1.5,
    "part": "",
    "category": ""
  },
  {
    "key": "Godown to CompanyBUNDLE",
    "place": "Godown to Company",
    "type": "BUNDLE",
    "unit": "",
    "rate": 2.8,
    "part": "",
    "category": ""
  },
  {
    "key": "Godown to Company BKTBUNDLE",
    "place": "Godown to Company BKT",
    "type": "BUNDLE",
    "unit": "",
    "rate": 10,
    "part": "",
    "category": ""
  },
  {
    "key": "GROUND FLOOR TO BUILDINGBUNDLE",
    "place": "GROUND FLOOR TO BUILDING",
    "type": "BUNDLE",
    "unit": "",
    "rate": 1.5,
    "part": "",
    "category": ""
  },
  {
    "key": "BUILDING TO BUILDINGBUNDLE",
    "place": "BUILDING TO BUILDING",
    "type": "BUNDLE",
    "unit": "",
    "rate": 2.8,
    "part": "",
    "category": ""
  },
  {
    "key": "BUILDING TO BUILDINGBAG",
    "place": "BUILDING TO BUILDING",
    "type": "BAG",
    "unit": "",
    "rate": 2.8,
    "part": "",
    "category": ""
  },
  {
    "key": "BUILDING TO GROUND FLOORRACK",
    "place": "BUILDING TO GROUND FLOOR",
    "type": "RACK",
    "unit": "",
    "rate": 25,
    "part": "",
    "category": ""
  },
  {
    "key": "LABELINGBOX",
    "place": "LABELING",
    "type": "BOX",
    "unit": "",
    "rate": 2,
    "part": "",
    "category": ""
  },
  {
    "key": "E5 TO DUYISRACK",
    "place": "E5 TO DUYIS",
    "type": "RACK",
    "unit": "",
    "rate": 50,
    "part": "",
    "category": ""
  },
  {
    "key": "BELT PACKINGRACK",
    "place": "BELT PACKING",
    "type": "RACK",
    "unit": "",
    "rate": 20,
    "part": "",
    "category": ""
  },
  {
    "key": "E5 TO DUYISRACK",
    "place": "E5 TO DUYIS",
    "type": "RACK",
    "unit": "",
    "rate": 50,
    "part": "",
    "category": ""
  },
  {
    "key": "BELT PACKINGRACK",
    "place": "BELT PACKING",
    "type": "RACK",
    "unit": "",
    "rate": 20,
    "part": "",
    "category": ""
  }
];

// Rapid key-indexed map for O(1) exact lookups
const RATE_MAP: Map<string, MasterRateItem> = new Map();
MASTER_RATES.forEach(r => {
  const normKey = r.key.replace(/\s+/g, '').toUpperCase();
  if (!RATE_MAP.has(normKey)) {
    RATE_MAP.set(normKey, r);
  }
});

// Dictionary of common OCR muddles, Marathi translations, and factory nicknames
export const FACTORY_GLOSSARY: Record<string, string> = {
  // Marathi factory terms
  'PRACHUTAN': 'PARCHUTAN',
  'PRATICHUTAN': 'PARCHUTAN',
  'PARCHUTAN MATERIAL': 'PARCHUTAN',
  'LOOSE': 'PARCHUTAN',
  'MT RACK': 'MT RACK',
  'MT RACKS': 'MT RACK',
  'EMPTY RACK': 'MT RACK',
  'MT BARREL': 'MT BARREL',
  'EMPTY BARREL': 'MT BARREL',
  'MT BKT': 'MT BKT',
  'WARAL': 'WARAI',
  'WARSI': 'WARAI',
  'WARDI': 'WARAI',
  'THAPI': 'STACKING',
  'HOPER': 'HOPPER',
  'SUGAR IN HOPER': 'SUGAR IN HOPPER',
  'CHOKITA': 'CHOCITA',
  
  // Ingredients & Products
  'BICOFF': 'BISCOFF',
  'BISSCOFF': 'BISCOFF',
  'BISKIT': 'BISCOFF',
  '8KT': 'BKT',
  'BRT': 'BKT',
  'C8': 'CB',
  'GB': 'CB',
  'CD': 'CB',
  
  // Factory zones & Machinery
  'ES': 'E5',
  'E-5': 'E5',
  'DUYIS': 'DUYVIS',
  'DRYVIS': 'DUYVIS',
  'DAYVIS': 'DUYVIS',
  'STORE MALA': 'STORE MALA',
  '10 TON MALA': '10 TON MALA',
  
  // Godowns
  'SULTANPOOR': 'SULTANPUR GODOWN',
  'NAWRODI': 'NARODI GODOWN',
  'AWASRI': 'AWASARI GODOWN',
  'LANDEWADI': 'LANDEWADI GODOWN'
};

// Comprehensive Devanagari Marathi-to-English translation & Godown routing engine
export const MARATHI_TO_ENGLISH_MAP: [RegExp, string][] = [
  // Specific Godowns
  [/काळे\s*गोडाऊन|काळे\s*गोडाउन/gi, 'Kale Godown'],
  [/काळे\s*अनलोडिंग|काळे\s*अनलोडींग/gi, 'Kale Unloading'],
  [/काळे\s*लोडिंग|काळे\s*लोडींग/gi, 'Kale Loading'],
  [/काळे/gi, 'Kale'],

  [/सुलतानपूर\s*गोडाऊन|सुलतानपुर\s*गोडाउन|सुलतानपूर|सुलतानपुर/gi, 'Sultanpur Godown'],
  [/नारोडी\s*गोडाऊन|नारोडी/gi, 'Narodi Godown'],
  [/अवसरी\s*गोडाऊन|आवसरी|अवसरी/gi, 'Awasari Godown'],
  [/लांडेवाडी\s*गोडाऊन|लांडेवाडी/gi, 'Landewadi Godown'],
  [/कौळे\s*मळा|कौळेमळा/gi, 'Kaulemala Godown'],
  [/पटेल\s*गोडाऊन|पटेल/gi, 'Patel Godown'],
  [/प्रतीक\s*गोडाऊन|प्रतिक|प्रतीक/gi, 'Pratik Godown'],
  [/थोरात\s*गोडाऊन|थोरात/gi, 'Thorat Godown'],
  [/भांगरे|बांगर/gi, 'Bangar Godown'],
  [/भराडी/gi, 'Bharadi Godown'],
  [/जीवन/gi, 'Jeevan Godown'],
  [/मनोरंजन/gi, 'Manoranjan Godown'],
  [/शेलार/gi, 'Shelar Godown'],
  [/परिहार/gi, 'Parihar Godown'],
  [/राठोड/gi, 'Rathod Godown'],

  // Yard & Company Operations
  [/पारिश्रेश\s*अनलोडिंग|परिसर\s*अनलोडिंग|परिसर\s*अनलोडींग/gi, 'Yard Unloading'],
  [/पारिश्रेश\s*लोडींग|पारिश्रेश\s*लोडिंग|परिसर\s*लोडींग|परिसर\s*लोडिंग/gi, 'Yard Loading'],
  [/पारिश्रेश|परिसर|परिसरामध्ये/gi, 'Yard'],
  [/कपनी\s*अनलोडिंग|कपनी\s*अनलोडींग|कंपनी\s*अनलोडिंग|कंपनी\s*अनलोडींग/gi, 'Company Unloading'],
  [/कपनी\s*लोडींग|कपनी\s*लोडिंग|कंपनी\s*लोडींग|कंपनी\s*लोडिंग/gi, 'Company Loading'],
  [/कपनी|कंपनी/gi, 'Company'],

  // Physical Actions & Pallets
  [/काढे\s*लोडिंग|काढे\s*लोडींग|काढणे\s*लोडिंग/gi, 'Moving & Loading'],
  [/काढे|काढणे/gi, 'Moving'],
  [/पॅलेट\s*हँडलिंग|पॅलेट\s*हॅन्डलींग|पॅलेट\s*हँडलींग/gi, 'Pallet Handling'],
  [/पॅलेट|पॅलेट्स/gi, 'Pallet'],
  [/थापी|थाप्पी/gi, 'Pallet Stacking'],
  [/गोडाऊन|गोडाउन/gi, 'Godown'],
  [/अनलोडींग|अनलोडिंग/gi, 'Unloading'],
  [/लोडींग|लोडिंग/gi, 'Loading'],
  [/वारफेअर/gi, 'Warfare'],
  [/वारई|वाराई/gi, 'Warai'],
  [/हातगाडी/gi, 'Hand Trolley'],
  [/पोते|पोती/gi, 'Bag'],
  [/खोके|खोका/gi, 'Box'],
  [/तळमजला/gi, 'Ground Floor'],
  [/बेसमेंट/gi, 'Basement'],
  [/स्टोअर|स्टोर/gi, 'Store'],
  [/परचुटण|पर्चुटण/gi, 'Parchutan'],
  [/गाड्यांमधी|गाड्यांमध्ये|गाडी/gi, 'Vehicle'],
  [/हमाली|हमाल/gi, 'Coolie'],
  [/शिल्लक/gi, 'Balance'],
  [/तास/gi, 'Hours'],
  [/दिवस/gi, 'Days'],
];

/**
 * Translates any Devanagari or Marathi phonetic text into clean English
 */
export function translateMarathiToEnglish(text: string): string {
  if (!text) return '';
  let res = text;
  for (const [regex, replacement] of MARATHI_TO_ENGLISH_MAP) {
    res = res.replace(regex, replacement);
  }
  // Preserve unknown source text so it can be reviewed; deleting it would hide OCR/translation failures.
  res = res.replace(/\s+/g, ' ').trim();
  return res;
}

/**
 * Normalizes text by removing non-alphanumeric noise and correcting common factory typos
 */
export function normalizeFactoryString(input: string): string {
  if (!input) return '';
  // First pass: translate any Marathi Devanagari words
  let str = translateMarathiToEnglish(input.trim()).toUpperCase();
  
  // Check direct glossary match
  if (FACTORY_GLOSSARY[str]) {
    str = FACTORY_GLOSSARY[str];
  }
  
  // Check partial replacements
  Object.keys(FACTORY_GLOSSARY).forEach(term => {
    if (str.includes(term) && term.length > 2) {
      str = str.replace(new RegExp(term, 'g'), FACTORY_GLOSSARY[term]);
    }
  });

  return str.replace(/\s+/g, ' ').trim();
}

/**
 * Standardize vehicle number plates e.g. "MH 14 KA 5025", "MH-14KA-5025" -> "MH14KA5025"
 */
export function normalizeVehicleNo(vNo: string): string {
  if (!vNo) return '';
  const clean = vNo.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
  if (clean.length >= 8 && clean.startsWith('MH')) {
    return clean;
  }
  return vNo.trim().toUpperCase();
}

/**
 * Look up the exact or best matching piece rate from MASTER SHEET (397 items)
 */
export function matchMasterRate(
  place: string,
  type: string,
  unitsKg?: string | number
): {
  rate: number;
  matchedKey: string;
  matchedPlace: string;
  matchedType: string;
  category: string;
  isExact: boolean;
} {
  const normPlace = normalizeFactoryString(place);
  const normType = normalizeFactoryString(type);
  const normUnit = unitsKg ? String(unitsKg).trim() : '';

  if (!normPlace || !normType) {
    return { rate: 0, matchedKey: '', matchedPlace: normPlace, matchedType: normType, category: '', isExact: false };
  }

  // 1. Exact composite key lookup: Place + Type + Unit
  const exactKey = (normPlace + normType + normUnit).replace(/\s+/g, '').toUpperCase();
  if (RATE_MAP.has(exactKey)) {
    const item = RATE_MAP.get(exactKey)!;
    return {
      rate: item.rate,
      matchedKey: item.key,
      matchedPlace: item.place,
      matchedType: item.type,
      category: item.category || 'FG',
      isExact: true
    };
  }

  // 2. Exact without unit e.g. Place + Type
  const keyNoUnit = (normPlace + normType).replace(/\s+/g, '').toUpperCase();
  if (RATE_MAP.has(keyNoUnit)) {
    const item = RATE_MAP.get(keyNoUnit)!;
    return {
      rate: item.rate,
      matchedKey: item.key,
      matchedPlace: item.place,
      matchedType: item.type,
      category: item.category || 'FG',
      isExact: true
    };
  }

  // Rates are financial data: require a full exact key and send unmatched rows for review.
  return {
    rate: 0,
    matchedKey: exactKey,
    matchedPlace: normPlace,
    matchedType: normType,
    category: '',
    isExact: false
  };
}
