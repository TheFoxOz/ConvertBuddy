// scripts/units.js
// 1. Import the dedicated currency functions
import { convertCurrency, listCurrencies } from "./currency.js";

/**
 * Defines all conversion categories, units, and conversion factors (to/from a base unit).
 *
 * Each category defines a common BASE unit (toBase: 1) for linear conversions.
 * The 'precision' defines the default rounding for results in this category.
 */
export const conversionData = {
    /* ------------------------- */
    /* Currency (Dynamic API)    */
    /* ------------------------- */
    Currency: {
        name: "Currency", // Added name property for UI
        icon: "fas fa-dollar-sign",
        units: {}, // Empty, as units are populated dynamically by listCurrencies()
        precision: 4, // Currency often requires more precision
        
        // 2. Add the custom conversion and listing functions from currency.js
        convert: convertCurrency, 
        list: listCurrencies,
    },

    /* ------------------------- */
    /* Length                      */
    /* ------------------------- */
    Length: {
        name: "Length", // Added name property
        icon: "fas fa-ruler",
        precision: 3,
        units: {
            // Base Unit: Meter (m)
            Meter: { name: "Meter", symbol: "m", toBase: 1 },
            Kilometer: { name: "Kilometer", symbol: "km", toBase: 1000 },
            Centimeter: { name: "Centimeter", symbol: "cm", toBase: 0.01 },
            Millimeter: { name: "Millimeter", symbol: "mm", toBase: 0.001 },
            Micrometer: { name: "Micrometer", symbol: "µm", toBase: 1e-6 },
            Nanometer: { name: "Nanometer", symbol: "nm", toBase: 1e-9 },
            Mile: { name: "Mile", symbol: "mi", toBase: 1609.34 },
            Yard: { name: "Yard", symbol: "yd", toBase: 0.9144 },
            Foot: { name: "Foot", symbol: "ft", toBase: 0.3048 },
            Inch: { name: "Inch", symbol: "in", toBase: 0.0254 },
        }
    },

    /* ------------------------- */
    /* Weight / Mass               */
    /* ------------------------- */
    Weight: {
        name: "Weight / Mass", // Added name property
        icon: "fas fa-weight-scale",
        precision: 3,
        units: {
            // Base Unit: Gram (g)
            Milligram: { name: "Milligram", symbol: "mg", toBase: 0.001 },
            Gram: { name: "Gram", symbol: "g", toBase: 1 },
            Kilogram: { name: "Kilogram", symbol: "kg", toBase: 1000 },
            Tonne: { name: "Tonne", symbol: "t", toBase: 1_000_000 },
            Pound: { name: "Pound", symbol: "lb", toBase: 453.592 },
            Ounce: { name: "Ounce", symbol: "oz", toBase: 28.3495 },
            Stone: { name: "Stone", symbol: "st", toBase: 6350.29 }
        }
    },

    /* ------------------------- */
    /* Temperature               */
    /* ------------------------- */
    Temperature: {
        name: "Temperature", // Added name property
        icon: "fas fa-temperature-half",
        precision: 2,
        units: {
            // Base Unit: Celsius (°C)
            Celsius: {
                name: "Celsius", symbol: "°C",
                toBase: v => v, // C to C (Base)
                fromBase: v => v // C (Base) to C
            },
            Fahrenheit: {
                name: "Fahrenheit", symbol: "°F",
                toBase: v => (v - 32) * (5 / 9), // F to C (Base)
                fromBase: v => v * (9 / 5) + 32 // C (Base) to F
            },
            Kelvin: {
                name: "Kelvin", symbol: "K",
                toBase: v => v - 273.15, // K to C (Base)
                fromBase: v => v + 273.15 // C (Base) to K
            }
        }
    },

    /* ------------------------- */
    /* Volume                    */
    /* ------------------------- */
    Volume: {
        name: "Volume", // Added name property
        icon: "fas fa-wine-bottle",
        precision: 3,
        units: {
            // Base Unit: Liter (L)
            Liter: { name: "Liter", symbol: "L", toBase: 1 },
            Milliliter: { name: "Milliliter", symbol: "mL", toBase: 0.001 },
            CubicMeter: { name: "Cubic Meter", symbol: "m³", toBase: 1000 },
            Gallon: { name: "Gallon", symbol: "gal", toBase: 3.78541 },
            Quart: { name: "Quart", symbol: "qt", toBase: 0.946353 },
            Pint: { name: "Pint", symbol: "pt", toBase: 0.473176 },
            Cup: { name: "Cup", symbol: "cup", toBase: 0.236588 },
            Tablespoon: { name: "Tablespoon", symbol: "tbsp", toBase: 0.0147868 },
            Teaspoon: { name: "Teaspoon", symbol: "tsp", toBase: 0.00492892 }
        }
    },

    /* ------------------------- */
    /* Area                      */
    /* ------------------------- */
    Area: {
        name: "Area", // Added name property
        icon: "fas fa-vector-square",
        precision: 2,
        units: {
            // Base Unit: Square Meter (m²)
            SquareMeter: { name: "Square Meter", symbol: "m²", toBase: 1 },
            SquareKilometer: { name: "Square Kilometer", symbol: "km²", toBase: 1_000_000 },
            SquareFoot: { name: "Square Foot", symbol: "ft²", toBase: 0.092903 },
            SquareInch: { name: "Square Inch", symbol: "in²", toBase: 0.00064516 },
            SquareMile: { name: "Square Mile", symbol: "mi²", toBase: 2_589_988 },
            Hectare: { name: "Hectare", symbol: "ha", toBase: 10_000 },
            Acre: { name: "Acre", symbol: "ac", toBase: 4046.86 }
        }
    },

    /* ------------------------- */
    /* Speed                     */
    /* ------------------------- */
    Speed: {
        name: "Speed", // Added name property
        icon: "fas fa-tachometer-alt",
        precision: 2,
        units: {
            // Base Unit: Meter/Second (m/s)
            "Meter/Second": { name: "Meter/Second", symbol: "m/s", toBase: 1 },
            "Kilometer/Hour": { name: "Kilometer/Hour", symbol: "km/h", toBase: 1 / 3.6 }, // 0.277778
            "Mile/Hour": { name: "Mile/Hour", symbol: "mph", toBase: 0.44704 },
            "Foot/Second": { name: "Foot/Second", symbol: "ft/s", toBase: 0.3048 },
            Knot: { name: "Knot", symbol: "kn", toBase: 0.514444 }
        }
    },

    /* ------------------------- */
    /* Time                      */
    /* ------------------------- */
    Time: {
        name: "Time", // Added name property
        icon: "fas fa-clock",
        precision: 0, // Time units are generally integer-based unless converting to seconds/fractional hours
        units: {
            // Base Unit: Second (s)
            Second: { name: "Second", symbol: "s", toBase: 1 },
            Minute: { name: "Minute", symbol: "min", toBase: 60 },
            Hour: { name: "Hour", symbol: "h", toBase: 3600 },
            Day: { name: "Day", symbol: "d", toBase: 86400 },
            Week: { name: "Week", symbol: "wk", toBase: 604800 }
        }
    },

    /* ------------------------- */
    /* Storage / Digital         */
    /* ------------------------- */
    Storage: {
        name: "Storage / Digital", // Added name property
        icon: "fas fa-database",
        precision: 2,
        units: {
            // Base Unit: Byte (B)
            Byte: { name: "Byte", symbol: "B", toBase: 1 },
            Kilobyte: { name: "Kilobyte", symbol: "KB", toBase: 1024 },
            Megabyte: { name: "Megabyte", symbol: "MB", toBase: 1024 ** 2 },
            Gigabyte: { name: "Gigabyte", symbol: "GB", toBase: 1024 ** 3 },
            Terabyte: { name: "Terabyte", symbol: "TB", toBase: 1024 ** 4 },
            Petabyte: { name: "Petabyte", symbol: "PB", toBase: 1024 ** 5 }
        }
    },

    /* ------------------------- */
    /* Energy                    */
    /* ------------------------- */
    Energy: {
        name: "Energy", // Added name property
        icon: "fas fa-bolt",
        precision: 2,
        units: {
            // Base Unit: Joule (J)
            Joule: { name: "Joule", symbol: "J", toBase: 1 },
            Kilojoule: { name: "Kilojoule", symbol: "kJ", toBase: 1000 },
            Calorie: { name: "Calorie", symbol: "cal", toBase: 4.184 },
            Kilocalorie: { name: "Kilocalorie", symbol: "kcal", toBase: 4184 },
            WattHour: { name: "Watt Hour", symbol: "Wh", toBase: 3600 },
            KilowattHour: { name: "Kilowatt Hour", symbol: "kWh", toBase: 3_600_000 }
        }
    },

    /* ------------------------- */
    /* Pressure                  */
    /* ------------------------- */
    Pressure: {
        name: "Pressure", // Added name property
        icon: "fas fa-compress-alt",
        precision: 2,
        units: {
            // Base Unit: Pascal (Pa)
            Pascal: { name: "Pascal", symbol: "Pa", toBase: 1 },
            Kilopascal: { name: "Kilopascal", symbol: "kPa", toBase: 1000 },
            Bar: { name: "Bar", symbol: "bar", toBase: 100000 },
            PSI: { name: "Pound/psi", symbol: "psi", toBase: 6894.76 },
            Atmosphere: { name: "Atmosphere", symbol: "atm", toBase: 101325 }
        }
    },

    /* ------------------------- */
    /* Frequency                 */
    /* ------------------------- */
    Frequency: {
        name: "Frequency", // Added name property
        icon: "fas fa-wave-square",
        precision: 2,
        units: {
            // Base Unit: Hertz (Hz)
            Hertz: { name: "Hertz", symbol: "Hz", toBase: 1 },
            Kilohertz: { name: "Kilohertz", symbol: "kHz", toBase: 1000 },
            Megahertz: { name: "Megahertz", symbol: "MHz", toBase: 1_000_000 },
            Gigahertz: { name: "Gigahertz", symbol: "GHz", toBase: 1_000_000_000 }
        }
    },

    /* ------------------------- */
    /* Angle                     */
    /* ------------------------- */
    Angle: {
        name: "Angle", // Added name property
        icon: "fas fa-compass-drafting",
        precision: 3,
        units: {
            // Base Unit: Degree (°)
            Degree: { name: "Degree", symbol: "°", toBase: 1 },
            // Note: Radian to Degree is 180/pi ≈ 57.2958
            Radian: { name: "Radian", symbol: "rad", toBase: 57.2958 },
            Gradian: { name: "Gradian", symbol: "grad", toBase: 0.9 }
        }
    },

    /* ------------------------- */
    /* Power                     */
    /* ------------------------- */
    Power: {
        name: "Power", // Added name property
        icon: "fas fa-plug",
        precision: 2,
        units: {
            // Base Unit: Watt (W)
            Watt: { name: "Watt", symbol: "W", toBase: 1 },
            Kilowatt: { name: "Kilowatt", symbol: "kW", toBase: 1000 },
            Megawatt: { name: "Megawatt", symbol: "MW", toBase: 1_000_000 },
            Horsepower: { name: "Horsepower", symbol: "hp", toBase: 745.7 }
        }
    },

    /* ------------------------- */
    /* Fuel Economy              */
    /* ------------------------- */
    FuelEconomy: {
        name: "Fuel Economy", // Added name property
        icon: "fas fa-gas-pump",
        precision: 2,
        units: {
            // Base Unit: MPG (US) - Note: L/100km uses reciprocal formula
            "MPG(US)": { name: "Miles per Gallon (US)", symbol: "MPG (US)", toBase: 1 },
            "MPG(UK)": { name: "Miles per Gallon (UK)", symbol: "MPG (UK)", toBase: 1.20095 },
            "L/100km": {
                name: "Liters per 100km", symbol: "L/100km",
                // Convert L/100km to MPG(US) (235.214 is the constant)
                toBase: v => 235.214 / v,
                fromBase: v => 235.214 / v
            }
        }
    },

    /* ------------------------- */
    /* Force                     */
    /* ------------------------- */
    Force: {
        name: "Force", // Added name property
        icon: "fas fa-hand-fist",
        precision: 2,
        units: {
            // Base Unit: Newton (N)
            Newton: { name: "Newton", symbol: "N", toBase: 1 },
            Kilonewton: { name: "Kilonewton", symbol: "kN", toBase: 1000 },
            PoundForce: { name: "Pound Force", symbol: "lbf", toBase: 4.44822 }
        }
    }
};

/* * NOTE: The updateCurrencyUnits function is no longer needed.
 * Currency units are listed directly using listCurrencies from currency.js.
 */
// export function updateCurrencyUnits(rates) { ... } // REMOVED

/* Default fallback icons, precision, and icon check */
for (const cat in conversionData) {
    if (!conversionData[cat].name) {
        // Fallback for missing name
        conversionData[cat].name = cat;
    }
    if (!conversionData[cat].icon) {
        conversionData[cat].icon = "fas fa-question";
    }
    // Default precision if not explicitly set
    if (typeof conversionData[cat].precision !== 'number') {
        conversionData[cat].precision = 6;
    }
}
