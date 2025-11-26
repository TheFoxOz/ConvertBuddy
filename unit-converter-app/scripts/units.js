export const conversionData = {
    Currency: { icon: 'fas fa-money-bill-wave', units: {} },
    Length: {
        icon: 'fas fa-ruler',
        units: {
            Meter: { symbol: "m", toBase: 1 },
            Kilometer: { symbol: "km", toBase: 1000 },
            Centimeter: { symbol: "cm", toBase: 0.01 },
            Millimeter: { symbol: "mm", toBase: 0.001 },
            Mile: { symbol: "mi", toBase: 1609.34 },
            Yard: { symbol: "yd", toBase: 0.9144 },
            Foot: { symbol: "ft", toBase: 0.3048 },
            Inch: { symbol: "in", toBase: 0.0254 }
        }
    },
    Weight: {
        icon: 'fas fa-weight-hanging',
        units: {
            Kilogram: { symbol: "kg", toBase: 1 },
            Gram: { symbol: "g", toBase: 0.001 },
            Milligram: { symbol: "mg", toBase: 0.000001 },
            Tonne: { symbol: "t", toBase: 1000 },
            Pound: { symbol: "lb", toBase: 0.453592 },
            Ounce: { symbol: "oz", toBase: 0.0283495 }
        }
    },
    Temperature: {
        icon: 'fas fa-temperature-half',
        units: {
            Celsius: { symbol: "°C", toBase: v => v, fromBase: v => v },
            Fahrenheit: { symbol: "°F", toBase: v => (v - 32) * 5/9, fromBase: v => v * 9/5 + 32 },
            Kelvin: { symbol: "K", toBase: v => v - 273.15, fromBase: v => v + 273.15 }
        }
    },
    Volume: {
        icon: 'fas fa-glass-whiskey',
        units: {
            Liter: { symbol: "L", toBase: 0.001 },
            Milliliter: { symbol: "mL", toBase: 0.000001 },
            CubicMeter: { symbol: "m³", toBase: 1 },
            Gallon: { symbol: "gal", toBase: 0.00378541 },
            Quart: { symbol: "qt", toBase: 0.000946353 },
            Cup: { symbol: "cup", toBase: 0.000236588 },
            Tablespoon: { symbol: "tbsp", toBase: 0.0000147868 },
            Teaspoon: { symbol: "tsp", toBase: 0.00000492892 }
        }
    },
    Area: {
        icon: 'fas fa-vector-square',
        units: {
            SquareMeter: { symbol: "m²", toBase: 1 },
            SquareKilometer: { symbol: "km²", toBase: 1_000_000 },
            SquareFoot: { symbol: "ft²", toBase: 0.092903 },
            SquareInch: { symbol: "in²", toBase: 0.00064516 },
            Hectare: { symbol: "ha", toBase: 10_000 },
            Acre: { symbol: "acre", toBase: 4046.86 }
        }
    },
    Speed: {
        icon: 'fas fa-tachometer-alt',
        units: {
            "Meter/Second": { symbol: "m/s", toBase: 1 },
            "Kilometer/Hour": { symbol: "km/h", toBase: 0.277778 },
            "Mile/Hour": { symbol: "mph", toBase: 0.44704 },
            "Foot/Second": { symbol: "ft/s", toBase: 0.3048 }
        }
    },
    Time: {
        icon: 'fas fa-clock',
        units: {
            Second: { symbol: "s", toBase: 1 },
            Minute: { symbol: "min", toBase: 60 },
            Hour: { symbol: "h", toBase: 3600 },
            Day: { symbol: "d", toBase: 86400 }
        }
    },
    Storage: {
        icon: 'fas fa-database',
        units: {
            Byte: { symbol: "B", toBase: 1 },
            Kilobyte: { symbol: "KB", toBase: 1024 },
            Megabyte: { symbol: "MB", toBase: 1024**2 },
            Gigabyte: { symbol: "GB", toBase: 1024**3 },
            Terabyte: { symbol: "TB", toBase: 1024**4 }
        }
    },
    Energy: {
        icon: 'fas fa-bolt',
        units: {
            Joule: { symbol: "J", toBase: 1 },
            Kilojoule: { symbol: "kJ", toBase: 1000 },
            Calorie: { symbol: "cal", toBase: 4.184 },
            Kilocalorie: { symbol: "kcal", toBase: 4184 },
            WattHour: { symbol: "Wh", toBase: 3600 },
            KilowattHour: { symbol: "kWh", toBase: 3_600_000 }
        }
    }
};
