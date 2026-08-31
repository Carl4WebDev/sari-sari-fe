import { useNavigate } from "react-router-dom";
import AuthModal from "../modals/AuthModal";

export default function RegisterPage() {
  const navigate = useNavigate();
  return <AuthModal isOpen={true} initialMode="register" onClose={() => navigate("/")} />;
}