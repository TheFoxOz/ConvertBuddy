// scripts/units.js - SINGLE SOURCE OF TRUTH FOR DATA

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
        name: "Currency",
        icon: "fas fa-dollar-sign",
        units: {}, // Empty, as units are populated dynamically by listCurrencies()
        precision: 4,
        convert: convertCurrency,
        list: listCurrencies,
    },

    /* ------------------------- */
    /* Length                      */
    /* ------------------------- */
    Length: {
        name: "Length",
        icon: "fas fa-ruler",
        precision: 3,
        units: {
            // Base Unit: Meter (m)
            Meter: { name: "Meter", symbol: "m", toBase: 1 },
            Kilometer: { name: "Kilometer", symbol: "km", toBase: 1_000 },
            Centimeter: { name: "Centimeter", symbol: "cm", toBase: 0.01 },
            Millimeter: { name: "Millimeter", symbol: "mm", toBase: 0.001 },
            Micrometer: { name: "Micrometer", symbol: "µm", toBase: 1e-6 },
            Nanometer: { name: "Nanometer", symbol: "nm", toBase: 1e-9 },
            Mile: { name: "Mile", symbol: "mi", toBase: 1_609.34 },
            Yard: { name: "Yard", symbol: "yd", toBase: 0.9144 },
            Foot: { name: "Foot", symbol: "ft", toBase: 0.3048 },
            Inch: { name: "Inch", symbol: "in", toBase: 0.0254 },
        }
    },

    /* ------------------------- */
    /* Weight / Mass             */
    /* ------------------------- */
    Weight: {
        name: "Weight / Mass",
        icon: "fas fa-weight-scale",
        precision: 3,
        units: {
            // Base Unit: Gram (g)
            Milligram: { name: "Milligram", symbol: "mg", toBase: 0.001 },
            Gram: { name: "Gram", symbol: "g", toBase: 1 },
            Kilogram: { name: "Kilogram", symbol: "kg", toBase: 1_000 },
            Tonne: { name: "Tonne", symbol: "t", toBase: 1_000_000 },
            Pound: { name: "Pound", symbol: "lb", toBase: 453.592 },
            Ounce: { name: "Ounce", symbol: "oz", toBase: 28.3495 },
            Stone: { name: "Stone", symbol: "st", toBase: 6_350.29 }
        }
    },

    /* ------------------------- */
    /* Temperature               */
    /* ------------------------- */
    Temperature: {
        name: "Temperature",
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
        name: "Volume",
        icon: "fas fa-wine-bottle",
        precision: 3,
        units: {
            // Base Unit: Liter (L)
            Liter: { name: "Liter", symbol: "L", toBase: 1 },
            Milliliter: { name: "Milliliter", symbol: "mL", toBase: 0.001 },
            CubicMeter: { name: "Cubic Meter", symbol: "m³", toBase: 1_000 },
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
        name: "Area",
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
            Acre: { name: "Acre", symbol: "ac", toBase: 4_046.86 }
        }
    },

    /* ------------------------- */
    /* Speed                     */
    /* ------------------------- */
    Speed: {
        name: "Speed",
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
        name: "Time",
        icon: "fas fa-clock",
        precision: 2, // FIX: Changed from 0 to 2 to handle fractional time conversions
        units: {
            // Base Unit: Second (s)
            Second: { name: "Second", symbol: "s", toBase: 1 },
            Minute: { name: "Minute", symbol: "min", toBase: 60 },
            Hour: { name: "Hour", symbol: "h", toBase: 3_600 },
            Day: { name: "Day", symbol: "d", toBase: 86_400 },
            Week: { name: "Week", symbol: "wk", toBase: 604_800 }
        }
    },
    
    // --- RESTORED CATEGORY: Time (Extended/Longer periods) ---
    "Time(Extended)": {
        name: "Time (Extended)",
        icon: "fas fa-hourglass",
        precision: 2,
        units: {
            // Base Unit: Day (d)
            Day: { name: "Day", symbol: "d", toBase: 1 },
            Week: { name: "Week", symbol: "wk", toBase: 7 },
            Month: { name: "Month (Avg)", symbol: "mo", toBase: 30.4375 }, // Average days in a month
            Year: { name: "Year (Avg)", symbol: "yr", toBase: 365.25 }, // Average days in a year
            Decade: { name: "Decade", symbol: "dec", toBase: 3_652.5 },
            Century: { name: "Century", symbol: "cent", toBase: 36_525 },
        }
    },

    /* ------------------------- */
    /* Storage / Digital         */
    /* ------------------------- */
    Storage: {
        name: "Storage / Digital (Byte)",
        icon: "fas fa-database",
        precision: 2,
        units: {
            // Base Unit: Byte (B) - Uses 1024 for standard computing
            Byte: { name: "Byte", symbol: "B", toBase: 1 },
            Kilobyte: { name: "Kilobyte", symbol: "KB", toBase: 1_024 },
            Megabyte: { name: "Megabyte", symbol: "MB", toBase: 1_024 ** 2 },
            Gigabyte: { name: "Gigabyte", symbol: "GB", toBase: 1_024 ** 3 },
            Terabyte: { name: "Terabyte", symbol: "TB", toBase: 1_024 ** 4 },
            Petabyte: { name: "Petabyte", symbol: "PB", toBase: 1_024 ** 5 }
        }
    },

    // --- RESTORED CATEGORY: Digital (Bit-based) ---
    Digital: {
        name: "Digital (Bit)",
        icon: "fas fa-binary",
        precision: 2,
        units: {
            // Base Unit: Bit (b)
            Bit: { name: "Bit", symbol: "b", toBase: 1 },
            Kilobit: { name: "Kilobit", symbol: "kb", toBase: 1_024 },
            Megabit: { name: "Megabit", symbol: "Mb", toBase: 1_024 ** 2 },
            Gigabit: { name: "Gigabit", symbol: "Gb", toBase: 1_024 ** 3 },
            Terabit: { name: "Terabit", symbol: "Tb", toBase: 1_024 ** 4 },
            Petabit: { name: "Petabit", symbol: "Pb", toBase: 1_024 ** 5 }
        }
    },


    /* ------------------------- */
    /* Energy                    */
    /* ------------------------- */
    Energy: {
        name: "Energy",
        icon: "fas fa-bolt",
        precision: 2,
        units: {
            // Base Unit: Joule (J)
            Joule: { name: "Joule", symbol: "J", toBase: 1 },
            Kilojoule: { name: "Kilojoule", symbol: "kJ", toBase: 1_000 },
            Calorie: { name: "Calorie", symbol: "cal", toBase: 4.184 },
            Kilocalorie: { name: "Kilocalorie", symbol: "kcal", toBase: 4_184 },
            WattHour: { name: "Watt Hour", symbol: "Wh", toBase: 3_600 },
            KilowattHour: { name: "Kilowatt Hour", symbol: "kWh", toBase: 3_600_000 }
        }
    },

    /* ------------------------- */
    /* Pressure                  */
    /* ------------------------- */
    Pressure: {
        name: "Pressure",
        icon: "fas fa-compress-alt",
        precision: 2,
        units: {
            // Base Unit: Pascal (Pa)
            Pascal: { name: "Pascal", symbol: "Pa", toBase: 1 },
            Kilopascal: { name: "Kilopascal", symbol: "kPa", toBase: 1_000 },
            Bar: { name: "Bar", symbol: "bar", toBase: 100_000 },
            PSI: { name: "Pound/psi", symbol: "psi", toBase: 6_894.76 },
            Atmosphere: { name: "Atmosphere", symbol: "atm", toBase: 101_325 }
        }
    },

    /* ------------------------- */
    /* Frequency                 */
    /* ------------------------- */
    Frequency: {
        name: "Frequency",
        icon: "fas fa-wave-square",
        precision: 2,
        units: {
            // Base Unit: Hertz (Hz)
            Hertz: { name: "Hertz", symbol: "Hz", toBase: 1 },
            Kilohertz: { name: "Kilohertz", symbol: "kHz", toBase: 1_000 },
            Megahertz: { name: "Megahertz", symbol: "MHz", toBase: 1_000_000 },
            Gigahertz: { name: "Gigahertz", symbol: "GHz", toBase: 1_000_000_000 }
        }
    },

    /* ------------------------- */
    /* Angle                     */
    /* ------------------------- */
    Angle: {
        name: "Angle",
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
        name: "Power",
        icon: "fas fa-plug",
        precision: 2,
        units: {
            // Base Unit: Watt (W)
            Watt: { name: "Watt", symbol: "W", toBase: 1 },
            Kilowatt: { name: "Kilowatt", symbol: "kW", toBase: 1_000 },
            Megawatt: { name: "Megawatt", symbol: "MW", toBase: 1_000_000 },
            Horsepower: { name: "Horsepower", symbol: "hp", toBase: 745.7 }
        }
    },

    /* ------------------------- */
    /* Fuel Economy              */
    /* ------------------------- */
    FuelEconomy: {
        name: "Fuel Economy",
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
        name: "Force",
        icon: "fas fa-hand-fist",
        precision: 2,
        units: {
            // Base Unit: Newton (N)
            Newton: { name: "Newton", symbol: "N", toBase: 1 },
            Kilonewton: { name: "Kilonewton", symbol: "kN", toBase: 1_000 },
            PoundForce: { name: "Pound Force", symbol: "lbf", toBase: 4.44822 }
        }
    }
};

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
