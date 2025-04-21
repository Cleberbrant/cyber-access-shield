
import React from 'react';
import { CheckCircle, XCircle } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface QuestionResultProps {
  index: number;
  question: {
    id: string;
    text: string;
    correct: boolean;
    userAnswer: string;
    correctAnswer: string;
    explanation?: string;
  };
}

export function ResultQuestionRenderer({ index, question }: QuestionResultProps) {
  return (
    <Card key={question.id} className="overflow-hidden">
      <div className={`h-1 ${question.correct ? 'bg-green-500' : 'bg-red-500'}`} />
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-base font-medium">Questão {index + 1}</CardTitle>
          {question.correct ? (
            <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
              <CheckCircle className="h-3.5 w-3.5 mr-1" />
              Correta
            </span>
          ) : (
            <span className="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400">
              <XCircle className="h-3.5 w-3.5 mr-1" />
              Incorreta
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="py-3">
        <p className="mb-3">{question.text}</p>
        
        <div className="space-y-2 text-sm">
          <div>
            <span className="font-medium">Sua resposta: </span>
            <span className={question.correct ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}>
              {question.userAnswer}
            </span>
          </div>
          
          {!question.correct && (
            <div>
              <span className="font-medium">Resposta correta: </span>
              <span className="text-green-600 dark:text-green-400">{question.correctAnswer}</span>
            </div>
          )}
        </div>
      </CardContent>
      {question.explanation && (
        <CardFooter className="bg-muted/50 pt-3 pb-3">
          <div className="text-sm">
            <span className="font-medium">Explicação: </span>
            <span className="text-muted-foreground">{question.explanation}</span>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
