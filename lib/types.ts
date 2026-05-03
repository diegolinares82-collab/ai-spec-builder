export interface SpecRequest {
  idea: string;
  productType: string;
  industry: string;
  targetAudience: string;
}

export interface SpecResponse {
  vision: string;
  architecture: string;
  dataModels: string;
  apiEndpoints: string;
  components: string;
  techStack: string;
  roadmap: string;
}

export interface GenerateSpecRequest {
  description: string;
}

export interface GenerateSpecResponse {
  vision: string;
  users: string;
  features: string[];
  flows: string[];
  architecture: string;
  requirements: string;
}
