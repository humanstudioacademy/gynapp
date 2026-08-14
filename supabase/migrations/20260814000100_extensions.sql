-- Extensões necessárias
create extension if not exists "pgcrypto";   -- gen_random_uuid()
create extension if not exists "citext";     -- username case-insensitive
create extension if not exists "unaccent";   -- busca ignorando acentos
