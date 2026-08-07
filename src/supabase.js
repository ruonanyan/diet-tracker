import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://njvbkhhtpmsghggqmbsg.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5qdmJraGh0cG1zZ2hnZ3FtYnNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYxMjM4MzksImV4cCI6MjEwMTY5OTgzOX0.Cy12ZdMgCMOkhWZqPhNn0S2SUsFDJP5MF5bt6-arjcg'

export const supabase = createClient(supabaseUrl, supabaseKey)
