import { z } from 'zod';

export const nameField = z.string().trim().min(1, 'Enter your name.').max(100, 'Name is too long.');

export const emailField = z.string().trim().toLowerCase().email('Enter a valid email address.');

export const shortTextField = z.string().trim().max(200);

export const messageField = z.string().trim().min(1, 'Enter a message.').max(5000, 'Message is too long.');
