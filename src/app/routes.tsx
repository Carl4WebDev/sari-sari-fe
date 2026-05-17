import { Routes } from "react-router-dom";

import {publicRoutes} from "../feature/public/routes" 
import { featureRoutes } from "../feature/routes";
import { UserProvider } from "../feature/context/users/UserProvider";
import { BorrowerProvider } from "../feature/context/borrowers/BorrowerProvider";
import { LoanProvider } from "../feature/context/loans/LoanProvider";
import { PaymentProvider } from "../feature/context/payments/PaymentProvider";

export default function AppRoutes() {
  return (
    <PaymentProvider>
      <UserProvider>
        <BorrowerProvider>
          <LoanProvider>
            <Routes>
              {publicRoutes}
              {featureRoutes}
            </Routes>
          </LoanProvider>
        </BorrowerProvider>
      </UserProvider>
    </PaymentProvider>
  );
}
