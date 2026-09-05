import React from 'react';
import { ArchitectProfile } from '../../types/auth';
import { CinematicArchitecturalIntro } from './CinematicArchitecturalIntro';

export interface SignInViewProps {
  onSignInSuccess: (profile: Partial<ArchitectProfile>) => void;
  onNavigateToSignUp: () => void;
  onEnterAsGuest?: () => void;
  autoPlayIntro?: boolean;
}

/**
 * SignInView presents the cinematic ultra-premium architectural opening sequence
 * for LORA EDGE — Architectural Intelligence immediately BEFORE the Sign In panel,
 * and seamlessly transitions into the floating architectural sign-in console.
 */
export const SignInView: React.FC<SignInViewProps> = ({
  onSignInSuccess,
  onNavigateToSignUp,
  onEnterAsGuest,
  autoPlayIntro = true,
}) => {
  return (
    <CinematicArchitecturalIntro
      onSignInSuccess={onSignInSuccess}
      onNavigateToSignUp={onNavigateToSignUp}
      onEnterAsGuest={onEnterAsGuest}
      autoPlay={autoPlayIntro}
    />
  );
};

export { CinematicArchitecturalIntro };
