import type { Metadata } from "next";
import LoginForm from "@/components/admin/LoginForm";

export const metadata: Metadata = { title: "Admin Login" };

export default function AdminLoginPage() {
  return (
    <section className="relative flex min-h-[80vh] items-center justify-center overflow-hidden bg-royal-sheen px-5 py-24">
      <div className="texture-dots absolute inset-0 opacity-40" aria-hidden />
      <div className="relative w-full max-w-md">
        <LoginForm />
      </div>
    </section>
  );
}
