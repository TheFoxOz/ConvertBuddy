// scripts/units.js

/**
 * Defines all conversion categories, units, and conversion factors (to/from a base unit).
 *
 * Each category defines a common BASE unit (toBase: 1) for linear conversions.
 * For non-linear conversions (like Temperature, Fuel Economy), custom toBase/fromBase functions are used.
 */
export const conversionData = {
    /* ------------------------- */
    /* Currency (Dynamic API)    */
    /* ------------------------- */
    Currency: {
        icon: "fas fa-dollar-sign",
        units: {} // Auto-filled dynamically by fetchCurrencyRates(). Base is USD.
    },

    /* ------------------------- */
    /* Length                    */
    /* ------------------------- */
    Length: {
        icon: "fas fa-ruler",
        units: {
            // Base Unit: Meter (m)
            Meter: { name: "Meter (m)", toBase: 1 },
            Kilometer: { name: "Kilometer (km)", toBase: 1000 },
            Centimeter: { name: "Centimeter (cm)", toBase: 0.01 },
            Millimeter: { name: "Millimeter (mm)", toBase: 0.001 },
            Micrometer: { name: "Micrometer (µm)", toBase: 1e-6 },
            Nanometer: { name: "Nanometer (nm)", toBase: 1e-9 },
            Mile: { name: "Mile (mi)", toBase: 1609.34 },
            Yard: { name: "Yard (yd)", toBase: 0.9144 },
            Foot: { name: "Foot (ft)", toBase: 0.3048 },
            Inch: { name: "Inch (in)", toBase: 0.0254 },
        }
    },

    /* ------------------------- */
    /* Weight / Mass             */
    /* ------------------------- */
    Weight: {
        icon: "fas fa-weight-scale",
        units: {
            // Base Unit: Gram (g)
            Milligram: { name: "Milligram (mg)", toBase: 0.001 },
            Gram: { name: "Gram (g)", toBase: 1 },
            Kilogram: { name: "Kilogram (kg)", toBase: 1000 },
            Tonne: { name: "Tonne (t)", toBase: 1_000_000 },
            Pound: { name: "Pound (lb)", toBase: 453.592 },
            Ounce: { name: "Ounce (oz)", toBase: 28.3495 },
            Stone: { name: "Stone (st)", toBase: 6350.29 }
        }
    },

    /* ------------------------- */
    /* Temperature               */
    /* ------------------------- */
    Temperature: {
        icon: "fas fa-temperature-half",
        units: {
            // Base Unit: Celsius (°C)
            Celsius: {
                name: "Celsius (°C)",
                // NOTE: Conversion logic must be self-consistent.
                // Using Celsius as base for simplicity, but conversions are handled by functions.
                toBase: v => v, // C to C (Base)
                fromBase: v => v // C (Base) to C
            },
            Fahrenheit: {
                name: "Fahrenheit (°F)",
                toBase: v => (v - 32) * (5 / 9), // F to C (Base)
                fromBase: v => v * (9 / 5) + 32 // C (Base) to F
            },
            Kelvin: {
                name: "Kelvin (K)",
                toBase: v => v - 273.15, // K to C (Base)
                fromBase: v => v + 273.15 // C (Base) to K
            }
        }
    },

    /* ------------------------- */
    /* Volume                    */
    /* ------------------------- */
    Volume: {
        icon: "fas fa-wine-bottle",
        units: {
            // Base Unit: Liter (L)
            Liter: { name: "Liter (L)", toBase: 1 },
            Milliliter: { name: "Milliliter (mL)", toBase: 0.001 },
            CubicMeter: { name: "Cubic Meter (m³)", toBase: 1000 },
            Gallon: { name: "Gallon (gal)", toBase: 3.78541 },
            Quart: { name: "Quart (qt)", toBase: 0.946353 },
            Pint: { name: "Pint (pt)", toBase: 0.473176 },
            Cup: { name: "Cup (cup)", toBase: 0.236588 },
            Tablespoon: { name: "Tablespoon (tbsp)", toBase: 0.0147868 },
            Teaspoon: { name: "Teaspoon (tsp)", toBase: 0.00492892 }
        }
    },

    /* ------------------------- */
    /* Area                      */
    /* ------------------------- */
    Area: {
        icon: "fas fa-vector-square",
        units: {
            // Base Unit: Square Meter (m²)
            SquareMeter: { name: "Square Meter (m²)", toBase: 1 },
            SquareKilometer: { name: "Square Kilometer (km²)", toBase: 1_000_000 },
            SquareFoot: { name: "Square Foot (ft²)", toBase: 0.092903 },
            SquareInch: { name: "Square Inch (in²)", toBase: 0.00064516 },
            SquareMile: { name: "Square Mile (mi²)", toBase: 2_589_988 },
            Hectare: { name: "Hectare (ha)", toBase: 10_000 },
            Acre: { name: "Acre (ac)", toBase: 4046.86 }
        }
    },

    /* ------------------------- */
    /* Speed                     */
    /* ------------------------- */
    Speed: {
        icon: "fas fa-tachometer-alt",
        units: {
            // Base Unit: Meter/Second (m/s)
            "Meter/Second": { name: "Meter/Second (m/s)", toBase: 1 },
            "Kilometer/Hour": { name: "Kilometer/Hour (km/h)", toBase: 1 / 3.6 }, // 0.277778
            "Mile/Hour": { name: "Mile/Hour (mph)", toBase: 0.44704 },
            "Foot/Second": { name: "Foot/Second (ft/s)", toBase: 0.3048 },
            Knot: { name: "Knot (kn)", toBase: 0.514444 }
        }
    },

    /* ------------------------- */
    /* Time                      */
    /* ------------------------- */
    Time: {
        icon: "fas fa-clock",
        units: {
            // Base Unit: Second (s)
            Second: { name: "Second (s)", toBase: 1 },
            Minute: { name: "Minute (min)", toBase: 60 },
            Hour: { name: "Hour (h)", toBase: 3600 },
            Day: { name: "Day (d)", toBase: 86400 },
            Week: { name: "Week (wk)", toBase: 604800 }
        }
    },

    /* ------------------------- */
    /* Storage / Digital         */
    /* ------------------------- */
    Storage: {
        icon: "fas fa-database",
        units: {
            // Base Unit: Byte (B)
            Byte: { name: "Byte (B)", toBase: 1 },
            Kilobyte: { name: "Kilobyte (KB)", toBase: 1024 },
            Megabyte: { name: "Megabyte (MB)", toBase: 1024 ** 2 },
            Gigabyte: { name: "Gigabyte (GB)", toBase: 1024 ** 3 },
            Terabyte: { name: "Terabyte (TB)", toBase: 1024 ** 4 },
            Petabyte: { name: "Petabyte (PB)", toBase: 1024 ** 5 }
        }
    },

    /* ------------------------- */
    /* Energy                    */
    /* ------------------------- */
    Energy: {
        icon: "fas fa-bolt",
        units: {
            // Base Unit: Joule (J)
            Joule: { name: "Joule (J)", toBase: 1 },
            Kilojoule: { name: "Kilojoule (kJ)", toBase: 1000 },
            Calorie: { name: "Calorie (cal)", toBase: 4.184 },
            Kilocalorie: { name: "Kilocalorie (kcal)", toBase: 4184 },
            WattHour: { name: "Watt Hour (Wh)", toBase: 3600 },
            KilowattHour: { name: "Kilowatt Hour (kWh)", toBase: 3_600_000 }
        }
    },

    /* ------------------------- */
    /* Pressure                  */
    /* ------------------------- */
    Pressure: {
        icon: "fas fa-compress-alt",
        units: {
            // Base Unit: Pascal (Pa)
            Pascal: { name: "Pascal (Pa)", toBase: 1 },
            Kilopascal: { name: "Kilopascal (kPa)", toBase: 1000 },
            Bar: { name: "Bar (bar)", toBase: 100000 },
            PSI: { name: "Pound/psi", toBase: 6894.76 },
            Atmosphere: { name: "Atmosphere (atm)", toBase: 101325 }
        }
    },

    /* ------------------------- */
    /* Frequency                 */
    /* ------------------------- */
    Frequency: {
        icon: "fas fa-wave-square",
        units: {
            // Base Unit: Hertz (Hz)
            Hertz: { name: "Hertz (Hz)", toBase: 1 },
            Kilohertz: { name: "Kilohertz (kHz)", toBase: 1000 },
            Megahertz: { name: "Megahertz (MHz)", toBase: 1_000_000 },
            Gigahertz: { name: "Gigahertz (GHz)", toBase: 1_000_000_000 }
        }
    },

    /* ------------------------- */
    /* Angle                     */
    /* ------------------------- */
    Angle: {
        icon: "fas fa-compass-drafting",
        units: {
            // Base Unit: Degree (°)
            Degree: { name: "Degree (°)", toBase: 1 },
            // Note: Radian to Degree is 180/pi ≈ 57.2958
            Radian: { name: "Radian (rad)", toBase: 57.2958 },
            Gradian: { name: "Gradian (grad)", toBase: 0.9 }
        }
    },

    /* ------------------------- */
    /* Power                     */
    /* ------------------------- */
    Power: {
        icon: "fas fa-plug",
        units: {
            // Base Unit: Watt (W)
            Watt: { name: "Watt (W)", toBase: 1 },
            Kilowatt: { name: "Kilowatt (kW)", toBase: 1000 },
            Megawatt: { name: "Megawatt (MW)", toBase: 1_000_000 },
            Horsepower: { name: "Horsepower (hp)", toBase: 745.7 }
        }
    },

    /* ------------------------- */
    /* Fuel Economy              */
    /* ------------------------- */
    FuelEconomy: {
        icon: "fas fa-gas-pump",
        units: {
            // Base Unit: MPG (US) - Note: L/100km uses reciprocal formula
            "MPG(US)": { name: "Miles per Gallon (US)", toBase: 1 },
            "MPG(UK)": { name: "Miles per Gallon (UK)", toBase: 1.20095 },
            "L/100km": {
                name: "Liters per 100km",
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
        icon: "fas fa-hand-fist",
        units: {
            // Base Unit: Newton (N)
            Newton: { name: "Newton (N)", toBase: 1 },
            Kilonewton: { name: "Kilonewton (kN)", toBase: 1000 },
            PoundForce: { name: "Pound Force (lbf)", toBase: 4.44822 }
        }
    }
};

/**
 * Updates the Currency category in conversionData with new exchange rates.
 * @param {Object} rates - An object where keys are currency codes and values are USD base rates.
 */
export function updateCurrencyUnits(rates) {
    if (!rates || Object.keys(rates).length === 0) {
        console.warn("Attempted to update currency units with empty or null rates.");
        return;
    }

    // Set the base unit for currency to USD (since the API provides rates relative to USD)
    conversionData.Currency.units = Object.fromEntries(
        Object.entries(rates).map(([code, rate]) => [
            code,
            { name: code, toBase: rate } 
        ])
    );
    console.log(`Currency units updated with ${Object.keys(rates).length} rates.`);
}

/* Default fallback icons and icon check (optional, but good practice) */
for (const cat in conversionData) {
    if (!conversionData[cat].icon) {
        conversionData[cat].icon = "fas fa-question";
    }
}
