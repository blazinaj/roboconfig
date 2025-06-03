export type ComponentCategory = 
  | 'Drive' 
  | 'Controller' 
  | 'Power' 
  | 'Communication' 
  | 'Software' 
  | 'Object Manipulation' 
  | 'Sensors' 
  | 'Chassis';

export type RiskFactor = {
  id: string;
  name: string;
  severity: 1 | 2 | 3 | 4 | 5;
  probability: 1 | 2 | 3 | 4 | 5;
  description: string;
  mitigationStrategy?: string;
};

export type Component = {
  id: string;
  name: string;
  category: ComponentCategory;
  type: string;
  description: string;
  specifications: Record<string, string | number>;
  riskFactors: RiskFactor[];
  compatibility?: string[];
  image?: string;
  organization_id?: string;
  isExisting?: boolean;
};