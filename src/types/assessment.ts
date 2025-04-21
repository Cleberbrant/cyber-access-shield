
export interface AssessmentQuestion {
  id: string;
  type: "multiple-choice" | "true-false" | "short-answer" | "code" | "matching";
  text: string;
  options?: string[];
  code?: string;
  matches?: { left: string; right: string }[];
}

export interface Assessment {
  id: string;
  title: string;
  description: string;
  duration: number;
  questions: AssessmentQuestion[];
}
