/**
 * Tipos e interfaces para o sistema de logs de fraude
 */

export interface FraudLog {
  id: string;
  created_at: string;
  event_type: string;
  event_details: string | null;

  // Informações do usuário
  user_id: string;
  user_email: string | null;
  user_name: string | null;

  // Informações da avaliação
  assessment_id: string | null;
  assessment_title: string | null;

  // Informações da sessão
  session_id: string | null;
  session_started_at: string | null;

  // Metadados
  user_agent: string | null;
  ip_address: string | null;
}

export interface StudentLogs {
  student_id: string;
  student_email: string;
  student_name: string | null;
  session_ip: string | null;
  logs: FraudLog[];
  total_violations: number;
}

export interface AssessmentLogs {
  assessment_id: string;
  assessment_title: string;
  students: StudentLogs[];
  total_students_with_logs: number;
  total_violations: number;
}

export interface FraudStats {
  total_logs: number;
  total_students_flagged: number;
  total_assessments_with_logs: number;
  by_event_type: Record<string, number>;
  recent_logs: FraudLog[];
}

export interface FraudLogsFilters {
  assessmentId?: string | null;
  studentEmail?: string;
  eventType?: string;
  dateFrom?: string;
  dateTo?: string;
}
