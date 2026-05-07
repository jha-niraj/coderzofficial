import type { SupportedLanguage } from '../types/index';

export interface LanguageConfig {
  image: string;
  fileExtension: string;
  compileCmd?: string;
  runCmd: string;
  dockerAvailable: boolean;
}

export const LANGUAGE_CONFIGS: Record<SupportedLanguage, LanguageConfig> = {
  javascript: {
    image: 'node:20-alpine',
    fileExtension: '.js',
    runCmd: 'node {filename}',
    dockerAvailable: true,
  },
  typescript: {
    image: 'node:20-alpine',
    fileExtension: '.ts',
    runCmd: 'npx ts-node {filename}',
    dockerAvailable: true,
  },
  python: {
    image: 'python:3.12-alpine',
    fileExtension: '.py',
    runCmd: 'python3 {filename}',
    dockerAvailable: true,
  },
  java: {
    image: 'eclipse-temurin:21-jdk-alpine',
    fileExtension: '.java',
    compileCmd: 'javac {filename}',
    runCmd: 'java {classname}',
    dockerAvailable: true,
  },
  cpp: {
    image: 'gcc:13-alpine',
    fileExtension: '.cpp',
    compileCmd: 'g++ -o {output} {filename}',
    runCmd: './{output}',
    dockerAvailable: true,
  },
  c: {
    image: 'gcc:13-alpine',
    fileExtension: '.c',
    compileCmd: 'gcc -o {output} {filename}',
    runCmd: './{output}',
    dockerAvailable: true,
  },
};
