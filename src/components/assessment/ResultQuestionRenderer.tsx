
import React from 'react';
import { CheckCircle, XCircle, HelpCircle } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
  // Verificar valores vazios ou indefinidos
  const userAnswer = question.userAnswer?.trim() || "Sem resposta";
  const correctAnswer = question.correctAnswer?.trim() || "Não definida";
  
  // Log para depuração - verificar se os valores correspondem
  console.log(`Questão ${index + 1}: 
    ID: ${question.id}
    Resposta do usuário: "${userAnswer}"
    Resposta correta: "${correctAnswer}"
    Marcada como correta no banco: ${question.correct ? 'Sim' : 'Não'}
    Comparação direta: ${userAnswer.toLowerCase() === correctAnswer.toLowerCase() ? 'Igual' : 'Diferente'}
  `);

  return (
    <Card key={question.id} className="overflow-hidden">
      <div className={`h-1 ${question.correct ? 'bg-green-500' : 'bg-red-500'}`} />
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-base font-medium">Questão {index + 1}</CardTitle>
          {question.correct ? (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800/30">
              <CheckCircle className="h-3.5 w-3.5 mr-1" />
              Correta
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800/30">
              <XCircle className="h-3.5 w-3.5 mr-1" />
              Incorreta
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="py-3">
        <p className="mb-3">{question.text}</p>
        
        <div className="space-y-2 text-sm">
          <div className="p-2 bg-muted/40 rounded-md">
            <span className="font-medium">Sua resposta: </span>
            <span className={question.correct ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}>
              {userAnswer}
            </span>
          </div>
          
          {!question.correct && (
            <div className="p-2 bg-muted/40 rounded-md">
              <span className="font-medium">Resposta correta: </span>
              <span className="text-green-600 dark:text-green-400">{correctAnswer}</span>
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
