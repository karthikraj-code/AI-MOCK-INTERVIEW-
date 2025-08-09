import 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      jobRole?: string | null;
    } & DefaultSession['user'];
  }

  interface User {
    id: string;
    name: string;
    email: string;
    jobRole?: string | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    name: string;
    email: string;
    jobRole?: string | null;
  }
}