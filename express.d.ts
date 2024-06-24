//export {};

// declare global {
//   namespace Express {
//     export interface Request {
//       customuser: {};
//       session: {
//         visited: boolean
//       };
//     }
//   }
// }
// declare namespace Express {
//   interface Request {
//     session?: {
//       visited: boolean;
//     };
//   }
// }

//import "express";

declare global {
  namespace Express {
    interface User {
      user_id: number;
      surname: string;
      password: string;
      lastname: string;
      email: string;
      phone: string;
      address: string;
      role: string;
    }
  }
}

import "express-session";

declare module "express-session" {
  interface SessionData {
    visited?: boolean;
  }
}
