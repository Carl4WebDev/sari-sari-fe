import { useNavigate } from "react-router-dom";
import AuthModal from "../modals/AuthModal";

export default function LoginPage() {
  const navigate = useNavigate();
  return <AuthModal isOpen={true} initialMode="login" onClose={() => navigate("/")} />;
}