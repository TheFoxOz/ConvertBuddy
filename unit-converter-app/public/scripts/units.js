// scripts/units.js
// 1. Import the dedicated currency functions
import { convertCurrency, listCurrencies } from "./currency.js";

/**
 * All conversion categories – fully UK-localised.
 * Currency is now completely dynamic → the old Promise-bug is fixed.
 */
export const conversionData = {
    /* ------------------------- */
    /* Currency (Dynamic API)    */
    /* ------------------------- */
    Currency: {
        name: "Currency",
        icon: "fas fa-pound-sign",     // GBP symbol for UK users
        precision: 4,
        convert: convertCurrency,      // async conversion via API + cache
        list: listCurrencies,          // async unit list – this is the ONLY source of units
        // NO static `units` property → removes the Promise bug!
    },

    /* ------------------------- */
    /* Length (British spelling) */
    /* ------------------------- */
    Length: {
        name: "Length",
        icon: "fas fa-ruler",
        precision: 3,
        units: {
            // Base Unit: Metre (m)
            Meter:        { name: "Metre",      symbol: "m",   toBase: 1 },
            Kilometer:    { name: "Kilometre",  symbol: "km",  toBase: 1_000 },
            Centimeter:   { name: "Centimetre", symbol: "cm",  toBase: 0.01 },
            Millimeter:   { name: "Millimetre", symbol: "mm",  toBase: 0.001 },
            Micrometer:   { name: "Micrometre", symbol: "µm",  toBase: 1e-6 },
            Nanometer:    { name: "Nanometre",  symbol: "nm",  toBase: 1e-9 },
            Mile:         { name: "Mile",       symbol: "mi",  toBase: 1_609.34 },
            Yard:         { name: "Yard",       symbol: "yd",  toBase: 0.9144 },
            Foot:         { name: "Foot",       symbol: "ft",  toBase: 0.3048 },
            Inch:         { name: "Inch",       symbol: "in",  toBase: 0.0254 },
        }
    },

    /* ------------------------- */
    /* Weight / Mass (Stone kept – very British!) */
    /* ------------------------- */
    Weight: {
        name: "Weight / Mass",
        icon: "fas fa-weight-scale",
        precision: 3,
        units: {
            Milligram: { name: "Milligram",  symbol: "mg", toBase: 0.001 },
            Gram:      { name: "Gram",       symbol: "g",  toBase: 1 },
            Kilogram:  { name: "Kilogram",   symbol: "kg", toBase: 1_000 },
            Tonne:     { name: "Tonne",      symbol: "t",  toBase: 1_000_000 },
            Pound:     { name: "Pound",      symbol: "lb", toBase: 453.592 },
            Ounce:     { name: "Ounce",      symbol: "oz", toBase: 28.3495 },
            Stone:     { name: "Stone",      symbol: "st", toBase: 6_350.29 }
        }
    },

    /* ------------------------- */
    /* Temperature */
    /* ------------------------- */
    Temperature: {
        name: "Temperature",
        icon: "fas fa-temperature-half",
        precision: 2,
        units: {
            Celsius: {
                name: "Celsius", symbol: "°C",
                toBase: v => v,
                fromBase: v => v
            },
            Fahrenheit: {
                name: "Fahrenheit", symbol: "°F",
                toBase: v => (v - 32) * (5 / 9),
                fromBase: v => v * (9 / 5) + 32
            },
            Kelvin: {
                name: "Kelvin", symbol: "K",
                toBase: v => v - 273.15,
                fromBase: v => v + 273.15
            }
        }
    },

    /* ------------------------- */
    /* Volume */
    /* ------------------------- */
    Volume: {
        name: "Volume",
        icon: "fas fa-wine-bottle",
        precision: 3,
        units: {
            Litre:        { name: "Litre",        symbol: "L",   toBase: 1 },
            Millilitre:   { name: "Millilitre",   symbol: "mL",  toBase: 0.001 },
            CubicMetre:   { name: "Cubic Metre",  symbol: "m³",  toBase: 1_000 },
            Gallon:       { name: "Gallon (US)",  symbol: "gal", toBase: 3.78541 },
            Quart:        { name: "Quart",        symbol: "qt",  toBase: 0.946353 },
            Pint:         { name: "Pint",         symbol: "pt",  toBase: 0.473176 },
            Cup:          { name: "Cup",          symbol: "cup", toBase: 0.236588 },
            Tablespoon:   { name: "Tablespoon",   symbol: "tbsp",toBase: 0.0147868 },
            Teaspoon:     { name: "Teaspoon",     symbol: "tsp", toBase: 0.00492892 }
        }
    },

    /* ------------------------- */
    /* Area */
    /* ------------------------- */
    Area: {
        name: "Area",
        icon: "fas fa-vector-square",
        precision: 2,
        units: {
            SquareMetre:    { name: "Square Metre",    symbol: "m²",  toBase: 1 },
            SquareKilometre:{ name: "Square Kilometre",symbol: "km²", toBase: 1_000_000 },
            SquareFoot:     { name: "Square Foot",     symbol: "ft²", toBase: 0.092903 },
            SquareInch:     { name: "Square Inch",     symbol: "in²", toBase: 0.00064516 },
            SquareMile:     { name: "Square Mile",     symbol: "mi²", toBase: 2_589_988 },
            Hectare:        { name: "Hectare",         symbol: "ha",  toBase: 10_000 },
            Acre:           { name: "Acre",            symbol: "ac",  toBase: 4_046.86 }
        }
    },

    /* ------------------------- */
    /* Speed */
    /* ------------------------- */
    Speed: {
        name: "Speed",
        icon: "fas fa-tachometer-alt",
        precision: 2,
        units: {
            "Metre/Second":     { name: "Metre/Second",     symbol: "m/s",   toBase: 1 },
            "Kilometre/Hour":   { name: "Kilometre/Hour",   symbol: "km/h",  toBase: 1 / 3.6 },
            "Mile/Hour":        { name: "Mile/Hour",        symbol: "mph",   toBase: 0.44704 },
            "Foot/Second":      { name: "Foot/Second",      symbol: "ft/s",  toBase: 0.3048 },
            Knot:               { name: "Knot",             symbol: "kn",    toBase: 0.514444 }
        }
    },

    /* ------------------------- */
    /* Time */
    /* ------------------------- */
    Time: {
        name: "Time",
        icon: "fas fa-clock",
        precision: 2,
        units: {
            Second: { name: "Second", symbol: "s",   toBase: 1 },
            Minute: { name: "Minute", symbol: "min", toBase: 60 },
            Hour:   { name: "Hour",   symbol: "h",   toBase: 3_600 },
            Day:    { name: "Day",    symbol: "d",   toBase: 86_400 },
            Week:   { name: "Week",   symbol: "wk",  toBase: 604_800 }
        }
    },

    "Time(Extended)": {
        name: "Time (Extended)",
        icon: "fas fa-hourglass",
        precision: 2,
        units: {
            Day:     { name: "Day",           symbol: "d",    toBase: 1 },
            Week:    { name: "Week",          symbol: "wk",   toBase: 7 },
            Month:   { name: "Month (Avg)",   symbol: "mo",   toBase: 30.4375 },
            Year:    { name: "Year (Avg)",    symbol: "yr",   toBase: 365.25 },
            Decade:  { name: "Decade",        symbol: "dec",  toBase: 3_652.5 },
            Century: { name: "Century",       symbol: "cent", toBase: 36_525 },
        }
    },

    Storage: {
        name: "Storage / Digital (Byte)",
        icon: "fas fa-database",
        precision: 2,
        units: {
            Byte:      { name: "Byte",      symbol: "B",  toBase: 1 },
            Kilobyte:  { name: "Kilobyte",  symbol: "KB", toBase: 1_024 },
            Megabyte:  { name: "Megabyte",  symbol: "MB", toBase: 1_024 ** 2 },
            Gigabyte:  { name: "Gigabyte",  symbol: "GB", toBase: 1_024 ** 3 },
            Terabyte:  { name: "Terabyte",  symbol: "TB", toBase: 1_024 ** 4 },
            Petabyte:  { name: "Petabyte",  symbol: "PB", toBase: 1_024 ** 5 }
        }
    },

    Digital: {
        name: "Digital (Bit)",
        icon: "fas fa-microchip",
        precision: 2,
        units: {
            Bit:       { name: "Bit",       symbol: "b",  toBase: 1 },
            Kilobit:   { name: "Kilobit",   symbol: "kb", toBase: 1_024 },
            Megabit:   { name: "Megabit",   symbol: "Mb", toBase: 1_024 ** 2 },
            Gigabit:   { name: "Gigabit",   symbol: "Gb", toBase: 1_024 ** 3 },
            Terabit:   { name: "Terabit",   symbol: "Tb", toBase: 1_024 ** 4 },
            Petabit:   { name: "Petabit",   symbol: "Pb", toBase: 1_024 ** 5 }
        }
    },

    Energy: {
        name: "Energy",
        icon: "fas fa-bolt",
        precision: 2,
        units: {
            Joule:        { name: "Joule",        symbol: "J",   toBase: 1 },
            Kilojoule:    { name: "Kilojoule",    symbol: "kJ",  toBase: 1_000 },
            Calorie:      { name: "Calorie",      symbol: "cal", toBase: 4.184 },
            Kilocalorie:  { name: "Kilocalorie",  symbol: "kcal",toBase: 4_184 },
            WattHour:     { name: "Watt Hour",    symbol: "Wh",  toBase: 3_600 },
            KilowattHour: { name: "Kilowatt Hour",symbol: "kWh", toBase: 3_600_000 }
        }
    },

    Pressure: {
        name: "Pressure",
        icon: "fas fa-compress-alt",
        precision: 2,
        units: {
            Pascal:      { name: "Pascal",      symbol: "Pa",  toBase: 1 },
            Kilopascal:  { name: "Kilopascal",  symbol: "kPa", toBase: 1_000 },
            Bar:         { name: "Bar",         symbol: "bar", toBase: 100_000 },
            PSI:         { name: "PSI",         symbol: "psi", toBase: 6_894.76 },
            Atmosphere:  { name: "Atmosphere",  symbol: "atm", toBase: 101_325 }
        }
    },

    Frequency: {
        name: "Frequency",
        icon: "fas fa-wave-square",
        precision: 2,
        units: {
            Hertz:      { name: "Hertz",      symbol: "Hz",  toBase: 1 },
            Kilohertz:  { name: "Kilohertz",  symbol: "kHz", toBase: 1_000 },
            Megahertz:  { name: "Megahertz",  symbol: "MHz", toBase: 1_000_000 },
            Gigahertz:  { name: "Gigahertz",  symbol: "GHz", toBase: 1_000_000_000 }
        }
    },

    Angle: {
        name: "Angle",
        icon: "fas fa-compass-drafting",
        precision: 3,
        units: {
            Degree:  { name: "Degree",  symbol: "°",   toBase: 1 },
            Radian:  { name: "Radian",  symbol: "rad", toBase: 57.2958 },
            Gradian: { name: "Gradian", symbol: "grad",toBase: 0.9 }
        }
    },

    Power: {
        name: "Power",
        icon: "fas fa-plug",
        precision: 2,
        units: {
            Watt:       { name: "Watt",       symbol: "W",  toBase: 1 },
            Kilowatt:   { name: "Kilowatt",   symbol: "kW", toBase: 1_000 },
            Megawatt:   { name: "Megawatt",   symbol: "MW", toBase: 1_000_000 },
            Horsepower: { name: "Horsepower", symbol: "hp", toBase: 745.7 }
        }
    },

    FuelEconomy: {
        name: "Fuel Economy",
        icon: "fas fa-gas-pump",
        precision: 2,
        units: {
            "MPG(US)": { name: "Miles per Gallon (US)", symbol: "MPG (US)", toBase: 1 },
            "MPG(UK)": { name: "Miles per Gallon (UK)", symbol: "MPG (UK)", toBase: 1.20095 },
            "L/100km": {
                name: "Litres per 100 km",
                symbol: "L/100km",
                toBase: v => 235.214 / v,
                fromBase: v => 235.214 / v
            }
        }
    },

    Force: {
        name: "Force",
        icon: "fas fa-hand-fist",
        precision: 2,
        units: {
            Newton:      { name: "Newton",      symbol: "N",  toBase: 1 },
            Kilonewton:  { name: "Kilonewton",  symbol: "kN", toBase: 1_000 },
            PoundForce:  { name: "Pound Force", symbol: "lbf",toBase: 4.44822 }
        }
    }
};

/* Fallback values */
for (const cat in conversionData) {
    if (!conversionData[cat].name) conversionData[cat].name = cat;
    if (!conversionData[cat].icon) conversionData[cat].icon = "fas fa-question";
    if (typeof conversionData[cat].precision !== "number") conversionData[cat].precision = 6;
}
