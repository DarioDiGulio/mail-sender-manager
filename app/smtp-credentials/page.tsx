"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SmtpCredentialsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { register, handleSubmit, reset } = useForm();
  const [credentials, setCredentials] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetchCredentials();
    }
  }, [status, router]);

  const fetchCredentials = async () => {
    const response = await fetch("/api/smtp-credentials");
    if (response.ok) {
      const data = await response.json();
      setCredentials(data);
    }
  };

  const onSubmit = async (data) => {
    const response = await fetch("/api/smtp-credentials", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      reset();
      fetchCredentials();
    } else {
      setError("Failed to save SMTP credentials");
    }
  };

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">SMTP Credentials</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="mb-8">
        <div className="mb-4">
          <Label htmlFor="host">SMTP Host</Label>
          <Input id="host" {...register("host")} required />
        </div>
        <div className="mb-4">
          <Label htmlFor="port">SMTP Port</Label>
          <Input id="port" type="number" {...register("port")} required />
        </div>
        <div className="mb-4">
          <Label htmlFor="username">SMTP Username</Label>
          <Input id="username" {...register("username")} required />
        </div>
        <div className="mb-4">
          <Label htmlFor="password">SMTP Password</Label>
          <Input id="password" type="password" {...register("password")} required />
        </div>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <Button type="submit">Save Credentials</Button>
      </form>

      <h2 className="text-xl font-bold mb-2">Saved Credentials</h2>
      {credentials.map((cred) => (
        <div key={cred.id} className="mb-2">
          <p>Host: {cred.host}, Port: {cred.port}, Username: {cred.username}</p>
        </div>
      ))}
    </div>
  );
}