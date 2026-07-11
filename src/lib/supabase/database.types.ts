// Placeholder dos tipos do banco. Será substituído no M8 pelo arquivo
// gerado com: supabase gen types typescript --project-id <id>
// A forma abaixo espelha a saída do gerador para que os clients já
// possam ser tipados com createClient<Database>.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: Record<string, never>;
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
