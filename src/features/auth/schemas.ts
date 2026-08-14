import { z } from 'zod';

/** Regra do doc 04, seção 1.6: mínimo 8 caracteres, com letra e número. */
const password = z
  .string()
  .min(8, 'Use pelo menos 8 caracteres.')
  .regex(/[A-Za-zÀ-ÿ]/, 'Inclua pelo menos uma letra.')
  .regex(/[0-9]/, 'Inclua pelo menos um número.');

const email = z
  .string()
  .min(1, 'Informe seu e-mail.')
  .email('E-mail inválido.')
  .transform((value) => value.trim().toLowerCase());

export const signInSchema = z.object({
  email,
  password: z.string().min(1, 'Informe sua senha.'),
});

export const signUpSchema = z
  .object({
    fullName: z
      .string()
      .min(2, 'Informe seu nome.')
      .max(80, 'Nome muito longo.')
      .transform((value) => value.trim()),
    email,
    password,
    confirmPassword: z.string(),
    acceptedTerms: z.literal(true, {
      message: 'É preciso aceitar os termos para continuar.',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não conferem.',
    path: ['confirmPassword'],
  });

export const forgotPasswordSchema = z.object({ email });

export const resetPasswordSchema = z
  .object({
    password,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não conferem.',
    path: ['confirmPassword'],
  });

export type SignInInput = z.input<typeof signInSchema>;
export type SignUpInput = z.input<typeof signUpSchema>;
export type ForgotPasswordInput = z.input<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.input<typeof resetPasswordSchema>;
