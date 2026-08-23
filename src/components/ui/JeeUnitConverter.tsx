import React, { useState, useMemo } from 'react';
import { Latex } from './Latex';
import {
  ArrowRightLeft,
  Copy,
  Check,
  Zap,
  RotateCcw,
  Sparkles,
  Info,
  Scale,
  Compass,
  Gauge,
  Activity,
  Flame,
  Magnet,
  Radio,
  Sliders,
} from 'lucide-react';

export interface UnitCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  units: {
    id: string;
    label: string;
    symbol: string;
    toBase: (val: number) => number; // convert unit to standard base unit
    fromBase: (val: number) => number; // convert standard base unit to this unit
    latexSymbol: string;
  }[];
  commonPresets: {
    name: string;
    fromVal: number;
    fromUnit: string;
    toUnit: string;
    note: string;
  }[];
  jeeRelevance: string;
}

export const JEE_UNIT_CATEGORIES: UnitCategory[] = [
  {
    id: 'energy',
    name: 'Energy & Work',
    icon: <Zap className="w-3.5 h-3.5 text-amber-400" />,
    description: 'Crucial for Photoelectric effect, Bohr atom, work-energy theorem, and nuclear physics.',
    jeeRelevance: 'Photoelectric effect ($E = h\\nu - \\phi$), Bohr orbit energies ($E_n = -13.6/n^2\\text{ eV}$), Thermodynamics ($1\\text{ cal} = 4.184\\text{ J}$).',
    units: [
      {
        id: 'joule',
        label: 'Joules',
        symbol: 'J',
        latexSymbol: '\\text{J}',
        toBase: (v) => v,
        fromBase: (v) => v,
      },
      {
        id: 'ev',
        label: 'Electron-Volts',
        symbol: 'eV',
        latexSymbol: '\\text{eV}',
        toBase: (v) => v * 1.602176634e-19,
        fromBase: (v) => v / 1.602176634e-19,
      },
      {
        id: 'mev',
        label: 'Mega Electron-Volts',
        symbol: 'MeV',
        latexSymbol: '\\text{MeV}',
        toBase: (v) => v * 1.602176634e-13,
        fromBase: (v) => v / 1.602176634e-13,
      },
      {
        id: 'calorie',
        label: 'Calories (thermochemical)',
        symbol: 'cal',
        latexSymbol: '\\text{cal}',
        toBase: (v) => v * 4.184,
        fromBase: (v) => v / 4.184,
      },
      {
        id: 'kwh',
        label: 'Kilowatt-hour',
        symbol: 'kWh',
        latexSymbol: '\\text{kWh}',
        toBase: (v) => v * 3.6e6,
        fromBase: (v) => v / 3.6e6,
      },
      {
        id: 'erg',
        label: 'Erg (CGS)',
        symbol: 'erg',
        latexSymbol: '\\text{erg}',
        toBase: (v) => v * 1e-7,
        fromBase: (v) => v / 1e-7,
      },
      {
        id: 'rydberg',
        label: 'Rydberg energy',
        symbol: 'Ry',
        latexSymbol: '\\text{Ry}',
        toBase: (v) => v * 2.179872e-18,
        fromBase: (v) => v / 2.179872e-18,
      },
    ],
    commonPresets: [
      { name: '1 eV to Joules', fromVal: 1, fromUnit: 'ev', toUnit: 'joule', note: 'Elementary electronic charge scale' },
      { name: '13.6 eV (H Ionization) to J', fromVal: 13.6, fromUnit: 'ev', toUnit: 'joule', note: 'Hydrogen ground state binding energy' },
      { name: '1 cal to Joules', fromVal: 1, fromUnit: 'calorie', toUnit: 'joule', note: 'Mechanical equivalent of heat (Joule constant)' },
      { name: '1 kWh to Joules', fromVal: 1, fromUnit: 'kwh', toUnit: 'joule', note: 'Commercial unit of electrical power' },
      { name: '1 MeV to Joules', fromVal: 1, fromUnit: 'mev', toUnit: 'joule', note: 'Nuclear Q-value / binding energy' },
    ],
  },
  {
    id: 'angle',
    name: 'Angle & Angular Velocity',
    icon: <Compass className="w-3.5 h-3.5 text-cyan-400" />,
    description: 'Rotational kinematics, circular motion, trigonometry in vectors and wave optics.',
    jeeRelevance: 'Always use Radians in calculus derivatives ($d\\theta/dt$), simple harmonic motion ($\\omega = 2\\pi f$), and arc length ($s = r\\theta$).',
    units: [
      {
        id: 'deg',
        label: 'Degrees',
        symbol: '°',
        latexSymbol: '^{\\circ}',
        toBase: (v) => (v * Math.PI) / 180,
        fromBase: (v) => (v * 180) / Math.PI,
      },
      {
        id: 'rad',
        label: 'Radians (SI)',
        symbol: 'rad',
        latexSymbol: '\\text{rad}',
        toBase: (v) => v,
        fromBase: (v) => v,
      },
      {
        id: 'rev',
        label: 'Revolutions / Cycles',
        symbol: 'rev',
        latexSymbol: '\\text{rev}',
        toBase: (v) => v * 2 * Math.PI,
        fromBase: (v) => v / (2 * Math.PI),
      },
      {
        id: 'arcmin',
        label: 'Arcminutes',
        symbol: 'arcmin',
        latexSymbol: "'",
        toBase: (v) => (v * Math.PI) / (180 * 60),
        fromBase: (v) => (v * 180 * 60) / Math.PI,
      },
      {
        id: 'arcsec',
        label: 'Arcseconds',
        symbol: 'arcsec',
        latexSymbol: "''",
        toBase: (v) => (v * Math.PI) / (180 * 3600),
        fromBase: (v) => (v * 180 * 3600) / Math.PI,
      },
      {
        id: 'grad',
        label: 'Gradians',
        symbol: 'grad',
        latexSymbol: '\\text{grad}',
        toBase: (v) => (v * Math.PI) / 200,
        fromBase: (v) => (v * 200) / Math.PI,
      },
    ],
    commonPresets: [
      { name: '180° to Radians', fromVal: 180, fromUnit: 'deg', toUnit: 'rad', note: 'Standard half-circle rotation (π rad)' },
      { name: '90° to Radians', fromVal: 90, fromUnit: 'deg', toUnit: 'rad', note: 'Right angle (π/2 rad)' },
      { name: '30° to Radians', fromVal: 30, fromUnit: 'deg', toUnit: 'rad', note: 'π/6 rad for trig evaluation' },
      { name: '45° to Radians', fromVal: 45, fromUnit: 'deg', toUnit: 'rad', note: 'π/4 rad (max range projectile angle)' },
      { name: '1 rev to Radians', fromVal: 1, fromUnit: 'rev', toUnit: 'rad', note: 'Full cycle = 2π rad' },
    ],
  },
  {
    id: 'pressure',
    name: 'Pressure & Stress',
    icon: <Gauge className="w-3.5 h-3.5 text-emerald-400" />,
    description: 'Fluid mechanics, atmospheric barometers, ideal gas laws, and thermodynamics cycles.',
    jeeRelevance: 'Ideal gas law ($PV = nRT$) requires Pressure in Pascals ($1\\text{ atm} = 1.01325\\times 10^5\\text{ Pa} = 760\\text{ mmHg}$).',
    units: [
      {
        id: 'pa',
        label: 'Pascal ($N/m^2$)',
        symbol: 'Pa',
        latexSymbol: '\\text{Pa}',
        toBase: (v) => v,
        fromBase: (v) => v,
      },
      {
        id: 'kpa',
        label: 'Kilopascal',
        symbol: 'kPa',
        latexSymbol: '\\text{kPa}',
        toBase: (v) => v * 1000,
        fromBase: (v) => v / 1000,
      },
      {
        id: 'atm',
        label: 'Standard Atmosphere',
        symbol: 'atm',
        latexSymbol: '\\text{atm}',
        toBase: (v) => v * 101325,
        fromBase: (v) => v / 101325,
      },
      {
        id: 'bar',
        label: 'Bar',
        symbol: 'bar',
        latexSymbol: '\\text{bar}',
        toBase: (v) => v * 100000,
        fromBase: (v) => v / 100000,
      },
      {
        id: 'mmhg',
        label: 'Millimeters of Mercury (Torr)',
        symbol: 'mmHg',
        latexSymbol: '\\text{mmHg}',
        toBase: (v) => (v * 101325) / 760,
        fromBase: (v) => (v * 760) / 101325,
      },
      {
        id: 'cmhg',
        label: 'Centimeters of Mercury',
        symbol: 'cmHg',
        latexSymbol: '\\text{cmHg}',
        toBase: (v) => (v * 101325) / 76,
        fromBase: (v) => (v * 76) / 101325,
      },
    ],
    commonPresets: [
      { name: '1 atm to Pascals', fromVal: 1, fromUnit: 'atm', toUnit: 'pa', note: 'Standard atmospheric pressure at sea level' },
      { name: '760 mmHg to atm', fromVal: 760, fromUnit: 'mmhg', toUnit: 'atm', note: 'Torricelli barometer column height' },
      { name: '1 bar to Pascals', fromVal: 1, fromUnit: 'bar', toUnit: 'pa', note: 'Metric pressure unit (10^5 Pa)' },
      { name: '76 cmHg to Pascals', fromVal: 76, fromUnit: 'cmhg', toUnit: 'pa', note: 'Fluid U-tube mercury manometer problem' },
    ],
  },
  {
    id: 'length',
    name: 'Wavelength & Atomic Length',
    icon: <Radio className="w-3.5 h-3.5 text-fuchsia-400" />,
    description: 'De Broglie wavelength, Bohr orbital radius, X-rays, diffraction slits, and nuclear dimensions.',
    jeeRelevance: 'De Broglie wavelength ($\\lambda = h/p$), Bohr radius ($r_1 = 0.529\\text{ \\AA}$), Young slit spacing ($d \\sim \\text{mm}$, $\\lambda \\sim \\text{nm}$ or $\\text{\\AA}$).',
    units: [
      {
        id: 'meter',
        label: 'Meters (SI)',
        symbol: 'm',
        latexSymbol: '\\text{m}',
        toBase: (v) => v,
        fromBase: (v) => v,
      },
      {
        id: 'angstrom',
        label: 'Angstroms',
        symbol: 'Å',
        latexSymbol: '\\text{\\AA}',
        toBase: (v) => v * 1e-10,
        fromBase: (v) => v / 1e-10,
      },
      {
        id: 'nm',
        label: 'Nanometers',
        symbol: 'nm',
        latexSymbol: '\\text{nm}',
        toBase: (v) => v * 1e-9,
        fromBase: (v) => v / 1e-9,
      },
      {
        id: 'pm',
        label: 'Picometers',
        symbol: 'pm',
        latexSymbol: '\\text{pm}',
        toBase: (v) => v * 1e-12,
        fromBase: (v) => v / 1e-12,
      },
      {
        id: 'fm',
        label: 'Fermi / Femtometers',
        symbol: 'fm',
        latexSymbol: '\\text{fm}',
        toBase: (v) => v * 1e-15,
        fromBase: (v) => v / 1e-15,
      },
      {
        id: 'mm',
        label: 'Millimeters',
        symbol: 'mm',
        latexSymbol: '\\text{mm}',
        toBase: (v) => v * 1e-3,
        fromBase: (v) => v / 1e-3,
      },
      {
        id: 'cm',
        label: 'Centimeters',
        symbol: 'cm',
        latexSymbol: '\\text{cm}',
        toBase: (v) => v * 1e-2,
        fromBase: (v) => v / 1e-2,
      },
      {
        id: 'km',
        label: 'Kilometers',
        symbol: 'km',
        latexSymbol: '\\text{km}',
        toBase: (v) => v * 1e3,
        fromBase: (v) => v / 1e3,
      },
    ],
    commonPresets: [
      { name: '1 Å to Meters', fromVal: 1, fromUnit: 'angstrom', toUnit: 'meter', note: 'Atomic radius / optical wavelength scale' },
      { name: '5000 Å to nm', fromVal: 5000, fromUnit: 'angstrom', toUnit: 'nm', note: 'Visible green light wavelength' },
      { name: '0.529 Å (Bohr radius) to m', fromVal: 0.529, fromUnit: 'angstrom', toUnit: 'meter', note: 'First Bohr orbital radius a0' },
      { name: '1.2 fm (Nuclear radius) to m', fromVal: 1.2, fromUnit: 'fm', toUnit: 'meter', note: 'Nuclear dimension constant R0' },
    ],
  },
  {
    id: 'speed',
    name: 'Velocity & Speed',
    icon: <Activity className="w-3.5 h-3.5 text-blue-400" />,
    description: 'Kinematics word problems, Doppler effect for sound/light, and relativistic particle velocity.',
    jeeRelevance: 'Converting highway/train speeds ($km/h \\times \\frac{5}{18} = m/s$) and relativistic photon fractions ($c = 3\\times 10^8\\text{ m/s}$).',
    units: [
      {
        id: 'ms',
        label: 'Meters per second (SI)',
        symbol: 'm/s',
        latexSymbol: '\\text{m/s}',
        toBase: (v) => v,
        fromBase: (v) => v,
      },
      {
        id: 'kmh',
        label: 'Kilometers per hour',
        symbol: 'km/h',
        latexSymbol: '\\text{km/h}',
        toBase: (v) => (v * 5) / 18,
        fromBase: (v) => (v * 18) / 5,
      },
      {
        id: 'c',
        label: 'Speed of Light (c)',
        symbol: 'c',
        latexSymbol: 'c',
        toBase: (v) => v * 299792458,
        fromBase: (v) => v / 299792458,
      },
      {
        id: 'cms',
        label: 'Centimeters per second',
        symbol: 'cm/s',
        latexSymbol: '\\text{cm/s}',
        toBase: (v) => v * 0.01,
        fromBase: (v) => v * 100,
      },
      {
        id: 'mph',
        label: 'Miles per hour',
        symbol: 'mph',
        latexSymbol: '\\text{mph}',
        toBase: (v) => v * 0.44704,
        fromBase: (v) => v / 0.44704,
      },
    ],
    commonPresets: [
      { name: '72 km/h to m/s', fromVal: 72, fromUnit: 'kmh', toUnit: 'ms', note: 'Standard vehicle kinematics speed (20 m/s)' },
      { name: '36 km/h to m/s', fromVal: 36, fromUnit: 'kmh', toUnit: 'ms', note: '10 m/s base conversion' },
      { name: '108 km/h to m/s', fromVal: 108, fromUnit: 'kmh', toUnit: 'ms', note: '30 m/s highway speed' },
      { name: '0.6 c to m/s', fromVal: 0.6, fromUnit: 'c', toUnit: 'ms', note: 'Relativistic electrodynamics velocity' },
    ],
  },
  {
    id: 'em',
    name: 'Electromagnetism & Charge',
    icon: <Magnet className="w-3.5 h-3.5 text-purple-400" />,
    description: 'Magnetic induction ($B$), electric charge ($q$), capacitance ($C$), and flux.',
    jeeRelevance: 'Magnetic field ($1\\text{ Tesla} = 10^4\\text{ Gauss}$), Electrostatic CGS ($1\\text{ C} = 3\\times 10^9\\text{ statC / esu}$).',
    units: [
      {
        id: 'tesla',
        label: 'Tesla (SI)',
        symbol: 'T',
        latexSymbol: '\\text{T}',
        toBase: (v) => v,
        fromBase: (v) => v,
      },
      {
        id: 'gauss',
        label: 'Gauss (CGS)',
        symbol: 'G',
        latexSymbol: '\\text{G}',
        toBase: (v) => v * 1e-4,
        fromBase: (v) => v / 1e-4,
      },
      {
        id: 'coulomb',
        label: 'Coulomb (SI)',
        symbol: 'C',
        latexSymbol: '\\text{C}',
        toBase: (v) => v,
        fromBase: (v) => v,
      },
      {
        id: 'esu',
        label: 'statCoulomb (esu)',
        symbol: 'esu',
        latexSymbol: '\\text{esu}',
        toBase: (v) => v / 2.99792458e9,
        fromBase: (v) => v * 2.99792458e9,
      },
      {
        id: 'elementary',
        label: 'Elementary charge (e)',
        symbol: 'e',
        latexSymbol: 'e',
        toBase: (v) => v * 1.602176634e-19,
        fromBase: (v) => v / 1.602176634e-19,
      },
      {
        id: 'weber',
        label: 'Weber (Magnetic Flux)',
        symbol: 'Wb',
        latexSymbol: '\\text{Wb}',
        toBase: (v) => v,
        fromBase: (v) => v,
      },
      {
        id: 'maxwell',
        label: 'Maxwell (CGS Flux)',
        symbol: 'Mx',
        latexSymbol: '\\text{Mx}',
        toBase: (v) => v * 1e-8,
        fromBase: (v) => v / 1e-8,
      },
    ],
    commonPresets: [
      { name: '1 Tesla to Gauss', fromVal: 1, fromUnit: 'tesla', toUnit: 'gauss', note: '1 T = 10,000 Gauss' },
      { name: '0.5 Gauss (Earth Field) to T', fromVal: 0.5, fromUnit: 'gauss', toUnit: 'tesla', note: 'Geomagnetic horizontal field (~50 μT)' },
      { name: '1 Coulomb to esu', fromVal: 1, fromUnit: 'coulomb', toUnit: 'esu', note: '1 C = 3 × 10^9 statC' },
      { name: '1 Coulomb to e (charges)', fromVal: 1, fromUnit: 'coulomb', toUnit: 'elementary', note: '6.24 × 10^18 fundamental electrons' },
    ],
  },
  {
    id: 'mass',
    name: 'Nuclear Mass & Rest Energy',
    icon: <Scale className="w-3.5 h-3.5 text-rose-400" />,
    description: 'Nuclear binding energy, mass defect ($\\Delta m c^2$), alpha/beta decay, and atomic calculations.',
    jeeRelevance: 'Mass defect in unified atomic mass units ($1\\text{ amu} = 931.494\\text{ MeV}/c^2 = 1.6605\\times 10^{-27}\\text{ kg}$).',
    units: [
      {
        id: 'kg',
        label: 'Kilograms (SI)',
        symbol: 'kg',
        latexSymbol: '\\text{kg}',
        toBase: (v) => v,
        fromBase: (v) => v,
      },
      {
        id: 'gram',
        label: 'Grams',
        symbol: 'g',
        latexSymbol: '\\text{g}',
        toBase: (v) => v * 1e-3,
        fromBase: (v) => v * 1e3,
      },
      {
        id: 'amu',
        label: 'Atomic Mass Unit (u)',
        symbol: 'u',
        latexSymbol: '\\text{u}',
        toBase: (v) => v * 1.66053906660e-27,
        fromBase: (v) => v / 1.66053906660e-27,
      },
      {
        id: 'mev_c2',
        label: 'MeV/c² Equivalent',
        symbol: 'MeV/c²',
        latexSymbol: '\\text{MeV}/c^2',
        toBase: (v) => (v * 1.602176634e-13) / (299792458 * 299792458),
        fromBase: (v) => (v * 299792458 * 299792458) / 1.602176634e-13,
      },
      {
        id: 'electron_mass',
        label: 'Electron masses (me)',
        symbol: 'me',
        latexSymbol: 'm_e',
        toBase: (v) => v * 9.10938356e-31,
        fromBase: (v) => v / 9.10938356e-31,
      },
      {
        id: 'proton_mass',
        label: 'Proton masses (mp)',
        symbol: 'mp',
        latexSymbol: 'm_p',
        toBase: (v) => v * 1.6726219e-27,
        fromBase: (v) => v / 1.6726219e-27,
      },
    ],
    commonPresets: [
      { name: '1 u (amu) to MeV/c²', fromVal: 1, fromUnit: 'amu', toUnit: 'mev_c2', note: 'Standard JEE conversion: 1 amu ≈ 931.5 MeV' },
      { name: '1 u (amu) to kg', fromVal: 1, fromUnit: 'amu', toUnit: 'kg', note: '1.6605 × 10^-27 kg' },
      { name: '1 electron mass to kg', fromVal: 1, fromUnit: 'electron_mass', toUnit: 'kg', note: '9.11 × 10^-31 kg' },
      { name: '1 proton mass to MeV/c²', fromVal: 1, fromUnit: 'proton_mass', toUnit: 'mev_c2', note: '938.27 MeV rest energy' },
    ],
  },
  {
    id: 'temperature',
    name: 'Temperature',
    icon: <Flame className="w-3.5 h-3.5 text-orange-400" />,
    description: 'Thermodynamics, Carnot engine efficiency, Stefan-Boltzmann radiation, and kinetic theory of gases.',
    jeeRelevance: 'Always convert to Absolute Kelvin ($K = ^\\circ C + 273.15$) for kinetic energy ($E = \\frac{3}{2} k_B T$) and Carnot efficiency ($\\eta = 1 - T_C/T_H$).',
    units: [
      {
        id: 'kelvin',
        label: 'Kelvin (SI)',
        symbol: 'K',
        latexSymbol: '\\text{K}',
        toBase: (v) => v,
        fromBase: (v) => v,
      },
      {
        id: 'celsius',
        label: 'Celsius',
        symbol: '°C',
        latexSymbol: '^{\\circ}\\text{C}',
        toBase: (v) => v + 273.15,
        fromBase: (v) => v - 273.15,
      },
      {
        id: 'fahrenheit',
        label: 'Fahrenheit',
        symbol: '°F',
        latexSymbol: '^{\\circ}\\text{F}',
        toBase: (v) => ((v - 32) * 5) / 9 + 273.15,
        fromBase: (v) => ((v - 273.15) * 9) / 5 + 32,
      },
    ],
    commonPresets: [
      { name: '27°C (Room Temp) to K', fromVal: 27, fromUnit: 'celsius', toUnit: 'kelvin', note: 'Standard laboratory ambient: 300.15 K (~300 K in JEE)' },
      { name: '0°C (Ice Point) to K', fromVal: 0, fromUnit: 'celsius', toUnit: 'kelvin', note: '273.15 K' },
      { name: '100°C (Boiling Point) to K', fromVal: 100, fromUnit: 'celsius', toUnit: 'kelvin', note: '373.15 K steam point' },
      { name: '-273.15°C to K', fromVal: -273.15, fromUnit: 'celsius', toUnit: 'kelvin', note: 'Absolute Zero (0 K)' },
    ],
  },
];

export const JeeUnitConverter: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('energy');
  const [inputValue, setInputValue] = useState<string>('1');
  const [fromUnitId, setFromUnitId] = useState<string>('ev');
  const [toUnitId, setToUnitId] = useState<string>('joule');
  const [copied, setCopied] = useState<boolean>(false);

  // Active category definition
  const category = useMemo(() => {
    return JEE_UNIT_CATEGORIES.find((c) => c.id === selectedCategory) || JEE_UNIT_CATEGORIES[0];
  }, [selectedCategory]);

  // Ensure from/to units match current category
  const activeFromUnit = useMemo(() => {
    return category.units.find((u) => u.id === fromUnitId) || category.units[0];
  }, [category, fromUnitId]);

  const activeToUnit = useMemo(() => {
    return category.units.find((u) => u.id === toUnitId) || category.units[1] || category.units[0];
  }, [category, toUnitId]);

  const handleCategoryChange = (catId: string) => {
    setSelectedCategory(catId);
    const cat = JEE_UNIT_CATEGORIES.find((c) => c.id === catId);
    if (cat && cat.units.length >= 2) {
      setFromUnitId(cat.units[0].id);
      setToUnitId(cat.units[1].id);
      if (cat.commonPresets.length > 0) {
        setInputValue(String(cat.commonPresets[0].fromVal));
        setFromUnitId(cat.commonPresets[0].fromUnit);
        setToUnitId(cat.commonPresets[0].toUnit);
      }
    }
  };

  const handleSwapUnits = () => {
    const temp = fromUnitId;
    setFromUnitId(toUnitId);
    setToUnitId(temp);
  };

  // Compute conversion
  const computedResult = useMemo(() => {
    const num = parseFloat(inputValue);
    if (isNaN(num)) return null;

    try {
      const baseValue = activeFromUnit.toBase(num);
      const targetValue = activeToUnit.fromBase(baseValue);
      return targetValue;
    } catch {
      return null;
    }
  }, [inputValue, activeFromUnit, activeToUnit]);

  // Unit factor multiplier (1 unitFrom = ? unitTo)
  const unitMultiplier = useMemo(() => {
    try {
      const base1 = activeFromUnit.toBase(1);
      return activeToUnit.fromBase(base1);
    } catch {
      return null;
    }
  }, [activeFromUnit, activeToUnit]);

  // Format display numbers nicely
  const formatDisplay = (val: number | null): string => {
    if (val === null) return 'Invalid Input';
    if (val === 0) return '0';

    const absVal = Math.abs(val);
    if (absVal >= 0.001 && absVal < 100000) {
      // Standard readable decimal
      const fixed = val.toFixed(6);
      return parseFloat(fixed).toString();
    }
    // Scientific notation
    return val.toExponential(6).replace('e+', 'e+');
  };

  const handleCopyResult = () => {
    if (computedResult !== null) {
      const text = `${inputValue} ${activeFromUnit.symbol} = ${formatDisplay(computedResult)} ${activeToUnit.symbol}`;
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const applyPreset = (preset: { fromVal: number; fromUnit: string; toUnit: string }) => {
    setInputValue(String(preset.fromVal));
    setFromUnitId(preset.fromUnit);
    setToUnitId(preset.toUnit);
  };

  return (
    <div className="bg-[#0D0D12] border border-white/[0.08] rounded-2xl p-4 sm:p-5 space-y-4 shadow-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500/20 to-cyan-500/20 border border-amber-500/30 flex items-center justify-center text-amber-300">
            <Scale className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-zinc-100 flex items-center gap-2">
              <span>JEE Physics Unit & Dimension Converter</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                Instant Calculator
              </span>
            </h4>
            <p className="text-[11px] text-zinc-400">
              High-precision SI, CGS, and microscopic particle conversions for JEE Main & Advanced
            </p>
          </div>
        </div>
      </div>

      {/* Category Selection Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {JEE_UNIT_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => handleCategoryChange(cat.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 border shrink-0 ${
              selectedCategory === cat.id
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm font-bold'
                : 'bg-[#14141E] text-zinc-400 border-white/[0.06] hover:text-zinc-200 hover:border-white/[0.12]'
            }`}
          >
            {cat.icon}
            <span>{cat.name}</span>
          </button>
        ))}
      </div>

      {/* Converter Body */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center bg-[#131422] p-4 rounded-2xl border border-white/[0.08]">
        {/* From Side */}
        <div className="lg:col-span-5 space-y-2">
          <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex items-center justify-between">
            <span>From Quantity</span>
            <span className="text-cyan-400 font-mono text-[10px]">{activeFromUnit.symbol}</span>
          </label>
          <div className="space-y-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="e.g. 13.6 or 1.5e-3"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#09090D] border border-white/[0.12] text-white font-mono text-sm sm:text-base focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition"
            />

            <select
              value={fromUnitId}
              onChange={(e) => setFromUnitId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#1A1B2E] border border-white/[0.12] text-zinc-200 text-xs font-medium focus:outline-none focus:border-cyan-400 transition"
            >
              {category.units.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.label} ({u.symbol})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Middle Swap Button */}
        <div className="lg:col-span-2 flex flex-col items-center justify-center">
          <button
            onClick={handleSwapUnits}
            className="p-3 rounded-2xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 hover:text-white transition active:scale-90 shadow-sm"
            title="Swap conversion directions"
          >
            <ArrowRightLeft className="w-4 h-4" />
          </button>
        </div>

        {/* To Side */}
        <div className="lg:col-span-5 space-y-2">
          <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex items-center justify-between">
            <span>Converted Result</span>
            <span className="text-emerald-400 font-mono text-[10px]">{activeToUnit.symbol}</span>
          </label>
          <div className="space-y-2">
            <div className="w-full px-3.5 py-2.5 rounded-xl bg-[#09090D] border border-emerald-500/30 text-emerald-300 font-mono text-sm sm:text-base flex items-center justify-between overflow-x-auto min-h-[42px]">
              <span className="font-bold">{formatDisplay(computedResult)}</span>
              <button
                onClick={handleCopyResult}
                className="p-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-zinc-300 hover:text-white transition shrink-0 ml-2"
                title="Copy converted value"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            <select
              value={toUnitId}
              onChange={(e) => setToUnitId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#1A1B2E] border border-white/[0.12] text-zinc-200 text-xs font-medium focus:outline-none focus:border-cyan-400 transition"
            >
              {category.units.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.label} ({u.symbol})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Conversion Relationship Card */}
      {unitMultiplier !== null && (
        <div className="p-3.5 rounded-xl bg-[#11121C] border border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-zinc-300">
            <span className="font-semibold text-zinc-400">Conversion Multiplier:</span>
            <div className="px-2.5 py-1 rounded-lg bg-[#0A0A0E] border border-white/[0.08] font-mono text-cyan-300 text-[11px] font-bold">
              1 {activeFromUnit.symbol} = {formatDisplay(unitMultiplier)} {activeToUnit.symbol}
            </div>
          </div>

          <div className="text-[11px] text-zinc-400 italic flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>Multiply input by {formatDisplay(unitMultiplier)}</span>
          </div>
        </div>
      )}

      {/* Quick Common JEE Exam Presets */}
      {category.commonPresets.length > 0 && (
        <div className="space-y-2 pt-1">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-400 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>High-Yield JEE Standard Presets:</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {category.commonPresets.map((p, idx) => (
              <button
                key={idx}
                onClick={() => applyPreset(p)}
                className="p-2.5 rounded-xl bg-[#13141F] hover:bg-[#1A1C2C] border border-white/[0.06] hover:border-amber-500/40 text-left transition space-y-1 group"
              >
                <div className="text-xs font-bold text-zinc-200 group-hover:text-amber-300 flex items-center justify-between">
                  <span>{p.name}</span>
                  <span className="text-[10px] text-amber-400 opacity-0 group-hover:opacity-100 transition">Apply</span>
                </div>
                <div className="text-[10.5px] text-zinc-400 leading-snug line-clamp-1">
                  {p.note}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* JEE Examiner Context Insight */}
      <div className="p-3 rounded-xl bg-gradient-to-r from-cyan-950/20 to-indigo-950/20 border border-cyan-500/20 flex items-start gap-2.5 text-xs text-zinc-300 leading-relaxed">
        <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-cyan-200">JEE Syllabus Requirement: </span>
          <span className="text-zinc-300/90">{category.jeeRelevance}</span>
        </div>
      </div>
    </div>
  );
};
