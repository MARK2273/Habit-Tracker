CREATE TABLE public.habit_notes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  habit_id text REFERENCES public.habits(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  date date NOT NULL,
  note text NOT NULL,
  created_at timestamptz DEFAULT timezone('utc'::text, now()),
  UNIQUE(habit_id, user_id, date)
);

ALTER TABLE public.habit_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notes" ON public.habit_notes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notes" ON public.habit_notes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notes" ON public.habit_notes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notes" ON public.habit_notes
  FOR DELETE USING (auth.uid() = user_id);
