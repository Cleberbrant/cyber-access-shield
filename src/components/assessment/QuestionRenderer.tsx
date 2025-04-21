
import React from 'react';
import { MultipleChoiceQuestion } from "./question-types/MultipleChoiceQuestion";
import { TrueFalseQuestion } from "./question-types/TrueFalseQuestion";
import { CodeQuestion } from "./question-types/CodeQuestion";
import { ShortAnswerQuestion } from "./question-types/ShortAnswerQuestion";
import { MatchingQuestion } from "./question-types/MatchingQuestion";

interface QuestionRendererProps {
  question: {
    id: string;
    text: string;
    type: string;
    options?: string[];
    code?: string;
    matches?: { left: string; right: string; }[];
  };
  value: any;
  onAnswerChange: (questionId: string, value: any) => void;
  onMatchPairChange: (questionId: string, leftItem: string, rightItem: string) => void;
}

export function QuestionRenderer({ 
  question, 
  value, 
  onAnswerChange, 
  onMatchPairChange 
}: QuestionRendererProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">{question.text}</h3>
      
      {question.type === "multiple-choice" && question.options && (
        <MultipleChoiceQuestion
          id={question.id}
          options={question.options}
          value={value?.toString()}
          onChange={(value) => onAnswerChange(question.id, value)}
        />
      )}
      
      {question.type === "true-false" && (
        <TrueFalseQuestion
          id={question.id}
          value={value?.toString()}
          onChange={(value) => onAnswerChange(question.id, value)}
        />
      )}
      
      {question.type === "short-answer" && (
        <ShortAnswerQuestion
          value={value}
          onChange={(value) => onAnswerChange(question.id, value)}
        />
      )}
      
      {question.type === "code" && question.code && (
        <CodeQuestion
          code={question.code}
          value={value}
          onChange={(value) => onAnswerChange(question.id, value)}
        />
      )}
      
      {question.type === "matching" && question.matches && (
        <MatchingQuestion
          matches={question.matches}
          value={value}
          onChange={(leftItem, rightItem) => onMatchPairChange(question.id, leftItem, rightItem)}
        />
      )}
    </div>
  );
}
