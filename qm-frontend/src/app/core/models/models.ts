// Measurement types
export type MeasurementType = 'LENGTH' | 'WEIGHT' | 'VOLUME' | 'TEMPERATURE';

export type LengthUnit = 'FEET' | 'INCHES' | 'YARDS' | 'CENTIMETERS';
export type WeightUnit = 'MILLIGRAM' | 'GRAM' | 'KILOGRAM' | 'POUND' | 'TONNE';
export type VolumeUnit = 'LITRE' | 'MILLILITRE' | 'GALLON';
export type TemperatureUnit = 'CELSIUS' | 'FAHRENHEIT';

export type MeasurementUnit = LengthUnit | WeightUnit | VolumeUnit | TemperatureUnit;

export interface QuantityInput {
  value: number;
  unit: string;
  type: MeasurementType;
}

export interface ConvertRequest {
  quantity: QuantityInput;
  targetUnit: string;
}

export interface ArithmeticRequest {
  quantity1: QuantityInput;
  quantity2: QuantityInput;
}

export interface CompareRequest {
  quantity1: QuantityInput;
  quantity2: QuantityInput;
}

export interface MeasurementResponse {
  value: number;
  unit: string;
  type: string;
  isEqual?: boolean;
  error?: string;
  success: boolean;
}

export interface MeasurementRecord {
  id: number;
  timestamp: string;
  operation: string;
  operand1_Value?: number;
  operand1_Unit?: string;
  operand1_Type?: string;
  operand2_Value?: number;
  operand2_Unit?: string;
  operand2_Type?: string;
  result_Value?: number;
  result_Unit?: string;
  result_Type?: string;
  hasError: boolean;
  errorMessage?: string;
}

// Auth models
export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  username: string;
  expiresAt?: string;
}

export interface UserProfile {
  id: number;
  username: string;
  email: string;
  picture?: string;
  isGoogleUser: boolean;
  createdAt: string;
  lastLoginAt: string;
}

// Unit metadata for UI
export interface UnitOption {
  value: string;
  label: string;
  symbol: string;
}

export const UNIT_MAP: Record<MeasurementType, UnitOption[]> = {
  LENGTH: [
    { value: 'FEET', label: 'Feet', symbol: 'ft' },
    { value: 'INCHES', label: 'Inches', symbol: 'in' },
    { value: 'YARDS', label: 'Yards', symbol: 'yd' },
    { value: 'CENTIMETERS', label: 'Centimeters', symbol: 'cm' },
  ],
  WEIGHT: [
    { value: 'MILLIGRAM', label: 'Milligram', symbol: 'mg' },
    { value: 'GRAM', label: 'Gram', symbol: 'g' },
    { value: 'KILOGRAM', label: 'Kilogram', symbol: 'kg' },
    { value: 'POUND', label: 'Pound', symbol: 'lb' },
    { value: 'TONNE', label: 'Tonne', symbol: 't' },
  ],
  VOLUME: [
    { value: 'LITRE', label: 'Litre', symbol: 'L' },
    { value: 'MILLILITRE', label: 'Millilitre', symbol: 'mL' },
    { value: 'GALLON', label: 'Gallon', symbol: 'gal' },
  ],
  TEMPERATURE: [
    { value: 'CELSIUS', label: 'Celsius', symbol: '°C' },
    { value: 'FAHRENHEIT', label: 'Fahrenheit', symbol: '°F' },
  ],
};
