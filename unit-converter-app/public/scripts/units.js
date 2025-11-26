// scripts/units.js
export const conversionData = {
    Currency: {
        icon: "fas fa-dollar-sign", // default currency icon
        units: {} // filled dynamically from API
    },
    Length: {
        icon: "fas fa-ruler",
        units: {
            Meter: { name: "Meter (m)", toBase: 1 },
            Kilometer: { name: "Kilometer (km)", toBase: 1000 },
            Centimeter: { name: "Centimeter (cm)", toBase: 0.01 },
            Millimeter: { name: "Millimeter (mm)", toBase: 0.001 },
            Mile: { name: "Mile (mi)", toBase: 1609.34 },
            Yard: { name: "Yard (yd)", toBase: 0.9144 },
            Foot: { name: "Foot (ft)", toBase: 0.3048 },
            Inch: { name: "Inch (in)", toBase: 0.0254 }
        }
    },
    Weight: {
        icon: "fas fa-weight-scale",
        units: {
            Milligram: { name: "Milligram (mg)", toBase: 0.001 },
            Gram: { name: "Gram (g)", toBase: 1 },
            Kilogram: { name: "Kilogram (kg)", toBase: 1000 },
            Tonne: { name: "Tonne (t)", toBase: 1_000_000 },
            Pound: { name: "Pound (lb)", toBase: 453.592 },
            Ounce: { name: "Ounce (oz)", toBase: 28.3495 },
            Stone: { name: "Stone (st)", toBase: 6350.29 } // 1 stone = 6.35029 kg
        }
    },
    Temperature: {
        icon: "fas fa-temperature-half",
        units: {
            Celsius: { name: "Celsius (°C)", toBase: v => v, fromBase: v => v },
            Fahrenheit: { name: "Fahrenheit (°F)", toBase: v => (v - 32) * 5/9, fromBase: v => v * 9/5 + 32 },
            Kelvin: { name: "Kelvin (K)", toBase: v => v - 273.15, fromBase: v => v + 273.15 }
        }
    },
    Volume: {
        icon: "fas fa-wine-bottle",
        units: {
            Liter: { name: "Liter (L)", toBase: 1 },
            Milliliter: { name: "Milliliter (mL)", toBase: 0.001 },
            CubicMeter: { name: "Cubic Meter (m³)", toBase: 1000 },
            Gallon: { name: "Gallon (gal)", toBase: 3.78541 },
            Quart: { name: "Quart (qt)", toBase: 0.946353 },
            Cup: { name: "Cup (cup)", toBase: 0.236588 },
            Tablespoon: { name: "Tablespoon (tbsp)", toBase: 0.0147868 },
            Teaspoon: { name: "Teaspoon (tsp)", toBase: 0.00492892 }
        }
    },
    Area: {
        icon: "fas fa-vector-square",
        units: {
            SquareMeter: { name: "Square Meter (m²)", toBase: 1 },
            SquareKilometer: { name: "Square Kilometer (km²)", toBase: 1_000_000 },
            SquareFoot: { name: "Square Foot (ft²)", toBase: 0.092903 },
            SquareInch: { name: "Square Inch (in²)", toBase: 0.00064516 },
            Hectare: { name: "Hectare (ha)", toBase: 10_000 },
            Acre: { name: "Acre (acre)", toBase: 4046.86 }
        }
    },
    Speed: {
        icon: "fas fa-tachometer-alt",
        units: {
            "Meter/Second": { name: "Meter/Second (m/s)", toBase: 1 },
            "Kilometer/Hour": { name: "Kilometer/Hour (km/h)", toBase: 0.277778 },
            "Mile/Hour": { name: "Mile/Hour (mph)", toBase: 0.44704 },
            "Foot/Second": { name: "Foot/Second (ft/s)", toBase: 0.3048 }
        }
    },
    Time: {
        icon: "fas fa-clock",
        units: {
            Second: { name: "Second (s)", toBase: 1 },
            Minute: { name: "Minute (min)", toBase: 60 },
            Hour: { name: "Hour (h)", toBase: 3600 },
            Day: { name: "Day (d)", toBase: 86400 }
        }
    },
    Storage: {
        icon: "fas fa-database",
        units: {
            Byte: { name: "Byte (B)", toBase: 1 },
            Kilobyte: { name: "Kilobyte (KB)", toBase: 1024 },
            Megabyte: { name: "Megabyte (MB)", toBase: 1024 ** 2 },
            Gigabyte: { name: "Gigabyte (GB)", toBase: 1024 ** 3 },
            Terabyte: { name: "Terabyte (TB)", toBase: 1024 ** 4 }
        }
    },
    Energy: {
        icon: "fas fa-bolt",
        units: {
            Joule: { name: "Joule (J)", toBase: 1 },
            Kilojoule: { name: "Kilojoule (kJ)", toBase: 1000 },
            Calorie: { name: "Calorie (cal)", toBase: 4.184 },
            Kilocalorie: { name: "Kilocalorie (kcal)", toBase: 4184 },
            WattHour: { name: "WattHour (Wh)", toBase: 3600 },
            KilowattHour: { name: "KilowattHour (kWh)", toBase: 3_600_000 }
        }
    }
};

// Ensure every category has an icon
for (const cat in conversionData) {
    if (!conversionData[cat].icon) conversionData[cat].icon = "fas fa-question";
}
